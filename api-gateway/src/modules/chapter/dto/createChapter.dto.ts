import { IsInt, IsOptional } from 'class-validator';

export class CreateChapterDto {
  @IsInt()
  novelId: number;

  @IsOptional()
  @IsInt()
  afterChapterId?: number;
}
