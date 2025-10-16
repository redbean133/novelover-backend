import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ChapterService } from './chapter.service';
import { firstValueFrom } from 'rxjs';
import { PublicChapterResponseDto } from './dto/chapterResponse.dto';
import axios, { AxiosResponse } from 'axios';
import { Readable } from 'stream';

@WebSocketGateway({
  cors: { origin: 'http://192.168.40.149:5173' },
  namespace: 'chapter-audio',
})
export class AudioGateway {
  constructor(private readonly chapterService: ChapterService) {}

  @SubscribeMessage('start-chapter-audio')
  async handleStartAudio(
    @MessageBody() data: { chapterId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const { chapterId } = data;
    const chapter = await firstValueFrom<PublicChapterResponseDto>(
      this.chapterService.findOne(chapterId),
    );

    try {
      const response: AxiosResponse<Readable> = await axios.post(
        `http://${process.env.AI_SERVICE_HOST}:${process.env.AI_SERVICE_HTTP_PORT}/ai/tts/stream`,
        { text: chapter.content },
        {
          responseType: 'stream',
        },
      );

      const stream = response.data;

      stream.on('data', (chunk: Buffer) => {
        // console.log(
        //   '[API-Gateway][Chapter][AudioGateway] Receiving chunk:',
        //   chunk.length,
        //   'bytes',
        // );
        client.emit('chapter-audio-chunk', chunk);
      });

      stream.on('end', () => {
        console.log('[API-Gateway][Chapter][AudioGateway] Streaming ended');
        client.emit('chapter-audio-end');
      });

      stream.on('error', (error: Error) => {
        console.error(
          '[API-Gateway][Chapter][AudioGateway] Stream error:',
          error,
        );
        client.emit('chapter-audio-error', {
          message: 'Error when streaming audio',
        });
      });
    } catch (error) {
      console.error(
        '[API-Gateway][Chapter][AudioGateway] Error connect to AI Microservice:',
        error,
      );
      client.emit('chapter-audio-error', {
        message: 'Error connect to AI Microservice',
      });
    }
  }
}
