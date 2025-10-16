import { HttpStatus, Injectable } from '@nestjs/common';
import { GoogleGenAI, Modality } from '@google/genai';
import wav from 'wav';
import { RpcException } from '@nestjs/microservices';
import { PassThrough } from 'stream';
import { Observable } from 'rxjs';

interface LiveSession {
  sendRealtimeInput: (input: any) => void;
  close: () => void;
}

@Injectable()
export class TtsService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  async convertPcmBase64ToWavBuffer(
    base64Data: string,
    sampleRate = 24000,
    channels = 1,
    bitDepth = 16,
  ): Promise<Buffer> {
    const pcmBuffer = Buffer.from(base64Data, 'base64');
    const pass = new PassThrough();
    const writer = new wav.Writer({ channels, sampleRate, bitDepth });
    writer.pipe(pass);
    writer.write(pcmBuffer);
    writer.end();

    const chunks: Buffer[] = [];
    return new Promise((resolve, reject) => {
      pass.on('data', (chunk) => chunks.push(chunk));
      pass.on('end', () => resolve(Buffer.concat(chunks)));
      pass.on('error', reject);
    });
  }

  async generateSpeech(text: string, voiceName: string = 'Zephyr') {
    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
          languageCode: 'vi-VN',
        },
      },
    });

    const base64Data =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Data) {
      throw new RpcException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi từ Google Cloud AI. Không thể tạo tệp âm thanh',
      });
    }

    return await this.convertPcmBase64ToWavBuffer(base64Data);
  }

  streamAudio(text: string): Observable<Buffer> {
    return new Observable<Buffer>((subscriber) => {
      let session: LiveSession | null = null;
      let isCompleted = false;

      this.ai.live
        .connect({
          model: 'gemini-live-2.5-flash-preview',
          // gemini-2.5-flash-native-audio-preview-09-2025
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Zephyr' },
              },
              languageCode: 'vi-VN',
            },
            systemInstruction: 'Read the text',
          },
          callbacks: {
            onopen: () => {
              console.log(
                '[AI-Microservice][TTS][Service][Gemini] Session opened',
              );
            },
            onmessage: (message) => {
              if (isCompleted) return;

              const parts = message.serverContent?.modelTurn?.parts ?? [];
              for (const part of parts) {
                if (part.thought) {
                  console.log(
                    '[AI-Microservice][TTS][Service][Gemini] Skipping thought part',
                  );
                  continue;
                }

                if (part.inlineData?.data) {
                  try {
                    const binaryString = atob(part.inlineData.data);
                    const bytes = new Uint8Array(binaryString.length);
                    for (let i = 0; i < binaryString.length; i++) {
                      bytes[i] = binaryString.charCodeAt(i);
                    }
                    const buffer = Buffer.from(bytes);
                    setImmediate(() => subscriber.next(buffer));
                  } catch (error) {
                    console.error(
                      '[AI-Microservice][TTS][Service][Gemini] Decode error:',
                      error,
                    );
                  }
                }
              }

              if (message.serverContent?.turnComplete) {
                isCompleted = true;
                console.log(
                  '[AI-Microservice][TTS][Service][Gemini] Turn complete',
                );
                subscriber.complete();
              }
            },
            onerror: (error) => {
              console.error(
                '[AI-Microservice][TTS][Service][Gemini] Error:',
                error,
              );
              if (!isCompleted) {
                isCompleted = true;
                subscriber.error(error);
              }
            },
            onclose: () => {
              console.log(
                '[AI-Microservice][TTS][Service][Gemini] Session closed',
              );
              if (!isCompleted) {
                isCompleted = true;
                subscriber.complete();
              }
            },
          },
        })
        .then((sessionResolved) => {
          session = sessionResolved;
          if (!isCompleted) {
            console.log(
              '[AI-Microservice][TTS][Service][Gemini] Sending text input',
            );
            session.sendRealtimeInput({
              text: `Đọc chính xác văn bản sau: "${text}"`,
            });
          }
        })
        .catch((error) => {
          console.error(
            '[AI-Microservice][TTS][Service][Gemini] Connection error:',
            error,
          );
          if (!isCompleted) {
            isCompleted = true;
            subscriber.error(error);
          }
        });

      // Cleanup function when unsubscribe
      return () => {
        console.log('[AI-Microservice][TTS][Service][Gemini] Cleanup called');
        isCompleted = true;
        if (session) {
          try {
            session.close?.();
          } catch (error) {
            console.error(
              '[AI-Microservice][TTS][Service][Gemini] Error closing session:',
              error,
            );
          }
        }
      };
    });
  }
}
