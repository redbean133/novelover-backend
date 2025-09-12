import { PartialType } from '@nestjs/mapped-types';
import { CreateNovelDto } from './createNovel.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNovelDto extends PartialType(CreateNovelDto) {
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
