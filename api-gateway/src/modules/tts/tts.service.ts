import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class TtsService {
  constructor(@Inject('TTS_SERVICE') private readonly ttsClient: ClientProxy) {}

  generateSpeech(payload: {
    text: string;
    voiceName?: string;
    outputFileName?: string;
  }) {
    return this.ttsClient.send({ cmd: 'tts.generate-speech' }, payload);
  }
}
