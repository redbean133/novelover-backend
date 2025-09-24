import { PartialType } from '@nestjs/mapped-types';
import { CreateNovelDto } from './createNovel.dto';
import { IsOptional, IsUrl } from 'class-validator';

export class UpdateNovelDto extends PartialType(CreateNovelDto) {
  @IsOptional()
  @IsUrl()
  coverUrl?: string;
}
