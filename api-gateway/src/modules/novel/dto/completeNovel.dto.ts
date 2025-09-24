import { IsBoolean } from 'class-validator';

export class CompleteNovelDto {
  @IsBoolean()
  isCompleted: boolean;
}
