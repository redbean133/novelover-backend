import { HttpStatus, Injectable } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import wav from 'wav';
import { RpcException } from '@nestjs/microservices';
import { PassThrough } from 'stream';

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
      model: 'gemini-2.5-flash-preview-tts',
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
        message: 'Không thể tạo tệp âm thanh',
      });
    }

    return await this.convertPcmBase64ToWavBuffer(base64Data);
  }
}
