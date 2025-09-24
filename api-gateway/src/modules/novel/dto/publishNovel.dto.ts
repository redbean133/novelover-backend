import { IsBoolean } from 'class-validator';

export class PublishNovelDto {
  @IsBoolean()
  isPublished: boolean;
}
