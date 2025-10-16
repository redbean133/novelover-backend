import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AIService {
  constructor(@Inject('AI_SERVICE') private readonly aiClient: ClientProxy) {}

  generateSpeech(payload: {
    text: string;
    voiceName?: string;
    outputFileName?: string;
  }) {
    return this.aiClient.send({ cmd: 'ai.tts.generate-speech' }, payload);
  }
}
