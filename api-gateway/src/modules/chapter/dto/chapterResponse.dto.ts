import { Expose, Transform } from 'class-transformer';

export class ChapterResponseDto {
  @Expose()
  id: number;

  @Expose()
  novelId: number;

  @Expose()
  title: string;

  @Expose()
  content: string;

  @Expose()
  numberOfViews: number;

  @Expose()
  numberOfWords: number;

  @Expose()
  numberOfVotes: number;

  @Expose()
  isPublished: boolean;

  @Expose()
  @Transform(({ value }): Date | string => value ?? '')
  publishedAt: Date | null;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
