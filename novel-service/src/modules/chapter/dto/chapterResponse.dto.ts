import { Expose, Transform } from 'class-transformer';

export class PublicChapterInListResponseDto {
  @Expose()
  id: number;

  @Expose()
  title: string;
}

export class MyChapterInListResponseDto extends PublicChapterInListResponseDto {
  @Expose()
  numberOfViews: number;

  @Expose()
  numberOfVotes: number;

  @Expose()
  isPublished: boolean;

  @Expose()
  @Transform(({ value }): Date | string => value ?? '')
  publishedAt: Date | null;

  @Expose()
  updatedAt: Date;
}

export class PublicChapterResponseDto {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  novelId: number;

  @Expose()
  novelTitle: string;

  @Expose()
  totalChapters: number;

  @Expose()
  content: string;

  @Expose()
  numberOfViews: number;

  @Expose()
  numberOfWords: number;

  @Expose()
  numberOfVotes: number;

  @Expose()
  @Transform(({ value }): number => value ?? NaN)
  prevChapterId: number;

  @Expose()
  @Transform(({ value }): number => value ?? NaN)
  nextChapterId: number;

  @Expose()
  @Transform(({ value }): Date | string => value ?? '')
  publishedAt: Date | null;

  @Expose()
  @Transform(({ value }): string => value ?? '')
  audioUrl?: string;

  @Expose()
  @Transform(({ value }): number => value ?? NaN)
  audioVersion?: number;

  @Expose()
  contentVersion: number;
}

export class MyChapterResponseDto {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  novelId: number;

  @Expose()
  novelTitle: string;

  @Expose()
  content: string;

  @Expose()
  numberOfWords: number;

  @Expose()
  isPublished: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
