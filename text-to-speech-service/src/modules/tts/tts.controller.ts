import { Controller } from '@nestjs/common';
import { TtsService } from './tts.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class TtsController {
  constructor(private readonly ttsService: TtsService) {}

  @MessagePattern({ cmd: 'tts.generate-speech' })
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
}
