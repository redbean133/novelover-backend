import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { NovelService } from './novel.service';
import {
  PublicNovelInListResponseDto,
  PublicNovelResponseDto,
} from './dto/novelResponse.dto';

@Injectable()
export class PublicNovelService {
  constructor(private readonly novelService: NovelService) {}

  async findAll(query: {
    page?: number;
    limit?: number;
    genreId?: number;
    contributorId?: string;
    search?: string;
    status?: 'published' | 'draft';
  }) {
    const result = await this.novelService.findAll(query);
    return {
      ...result,
      data: plainToInstance(PublicNovelInListResponseDto, result.data, {
        excludeExtraneousValues: true,
      }),
    };
  }

  async findOne(id: number): Promise<PublicNovelResponseDto> {
    const novel = await this.novelService.findOne(id);

    return plainToInstance(PublicNovelResponseDto, novel, {
      excludeExtraneousValues: true,
    });
  }
}
