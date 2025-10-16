import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { PublicChapterResponseDto } from './dto/chapterResponse.dto';
import { MediaService } from '../media/media.service';
import { AIService } from '../ai/ai.service';

@Injectable()
export class ChapterService {
  constructor(
    @Inject('NOVEL_SERVICE') private readonly novelClient: ClientProxy,
    private readonly aiService: AIService,
    private readonly mediaService: MediaService,
  ) {}

  findOne(chapterId: number) {
    return this.novelClient.send(
      { cmd: 'chapter.find-one' },
      {
        chapterId,
      },
    );
  }

  findAll(query: {
    novelId?: number;
    page?: number;
    limit?: number;
    sort?: 'ASC' | 'DESC';
  }) {
    return this.novelClient.send(
      { cmd: 'chapter.find-all' },
      {
        query,
      },
    );
  }

  async findAudio(chapterId: number, voiceName?: string) {
    const chapter = await firstValueFrom<PublicChapterResponseDto>(
      this.findOne(chapterId),
    );

    if (chapter.audioVersion === chapter.contentVersion) return chapter;

    const newVersionAudioDataBuffer = await firstValueFrom<Buffer>(
      this.aiService.generateSpeech({ text: chapter.content, voiceName }),
    );

    const uploadResult = await firstValueFrom(
      this.mediaService.uploadMedia(
        newVersionAudioDataBuffer,
        'chapter-audio',
        'raw',
        `chapter-${chapterId}.wav`,
      ),
    );

    await firstValueFrom(
      this.novelClient.send(
        { cmd: 'chapter.update-audio' },
        { chapterId, audioUrl: uploadResult.url },
      ),
    );

    return this.findOne(chapterId);
  }

  checkVote(chapterId: number, userId: string) {
    return this.novelClient.send(
      { cmd: 'chapter.check-vote' },
      { chapterId, userId },
    );
  }

  vote(chapterId: number, userId: string) {
    return this.novelClient.send(
      { cmd: 'chapter.vote' },
      { chapterId, userId },
    );
  }

  unvote(chapterId: number, userId: string) {
    return this.novelClient.send(
      { cmd: 'chapter.unvote' },
      { chapterId, userId },
    );
  }
}
