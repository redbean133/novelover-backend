import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateChapterDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsOptional()
  isPublished?: boolean;

  @IsOptional()
  @IsUrl()
  audioUrl?: string;
}
