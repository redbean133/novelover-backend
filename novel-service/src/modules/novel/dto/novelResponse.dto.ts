import { Expose, Transform, Type } from 'class-transformer';

export class AuthorDto {
  @Expose()
  id: number;

  @Expose()
  name: string;
}

export class GenreDto {
  @Expose()
  id: number;

  @Expose()
  name: string;
}

export class NovelResponseDto {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  @Transform(({ value }): string => value ?? '')
  coverUrl: string | null;

  @Expose()
  isOriginal: boolean;

  @Expose()
  contributorId: string;

  @Expose()
  numberOfChapters: number;

  @Expose()
  numberOfPublishedChapters: number;

  @Expose()
  numberOfReviews: number;

  @Expose()
  numberOfVotes: number;

  @Expose()
  numberOfViews: number;

  @Expose()
  description: string;

  @Expose()
  averageRating: number;

  @Expose()
  isPublished: boolean;

  @Expose()
  @Transform(({ value }): Date | string => value ?? '')
  publishedAt: Date | null;

  @Expose()
  @Transform(({ value }): Date | string => value ?? '')
  completedAt: Date | null;

  @Expose()
  createdAt: Date;

  @Expose()
  lastUpdatedAt: Date;

  @Expose()
  @Transform(({ value }): Date | string => value ?? '')
  deletedAt: Date | null;

  @Expose()
  @Type(() => AuthorDto)
  author: AuthorDto;

  @Expose()
  @Type(() => GenreDto)
  genres: GenreDto[];
}
