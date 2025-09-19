import { IsOptional, IsString } from 'class-validator';

export class UpdateChapterDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsOptional()
  isPublished?: boolean;
}
