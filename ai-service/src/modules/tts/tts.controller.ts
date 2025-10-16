import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { TtsService } from './tts.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { Response } from 'express';

@Controller('ai/tts')
export class TtsController {
  constructor(private readonly ttsService: TtsService) {}

  @MessagePattern({ cmd: 'ai.tts.generate-speech' })
  async generateSpeech(
    @Payload()
    payload: {
      text: string;
      voiceName?: string;
    },
  ) {
    const base64Data = await this.ttsService.generateSpeech(
      payload.text,
      payload.voiceName,
    );

    return base64Data;
  }

  @Post('stream')
  streamAudio(@Body('text') text: string, @Res() res: Response): void {
    console.log(
      '[AI-Microservice][TTS][Controller] Starting audio stream for text length:',
      text.length,
    );

    res.setHeader('Content-Type', 'audio/pcm');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache');

    const stream = this.ttsService.streamAudio(text);
    let chunkCount = 0;

    stream.subscribe({
      next: (chunk: Buffer) => {
        chunkCount++;
        // console.log(
        //   `[AI-Microservice][TTS][Controller] Writing chunk #${chunkCount}:`,
        //   chunk.length,
        //   'bytes',
        // );
        res.write(chunk);
      },
      error: (err: unknown) => {
        const error = err instanceof Error ? err : new Error(String(err));
        console.error(
          '[AI-Microservice][TTS][Controller] Stream error:',
          error.message,
        );

        if (!res.headersSent) {
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: '[AI-Microservice][TTS][Controller] Audio streaming error',
            error: error.message,
          });
        } else {
          res.end();
        }
      },
      complete: () => {
        console.log(
          `[AI-Microservice][TTS][Controller] Stream complete. Total chunks: ${chunkCount}`,
        );
        res.end();
      },
    });
  }
}
