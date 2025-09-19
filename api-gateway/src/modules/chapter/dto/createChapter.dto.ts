import { IsInt } from 'class-validator';

export class CreateChapterDto {
  @IsInt()
  novelId: number;
}
