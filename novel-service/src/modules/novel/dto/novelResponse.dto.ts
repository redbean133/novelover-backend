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

export class MyNovelInListResponseDto {
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
  numberOfPublishedChapters: number;

  @Expose()
  numberOfChapters: number;

  @Expose()
  numberOfViews: number;

  @Expose()
  @Type(() => AuthorDto)
  author: AuthorDto;

  @Expose()
  isCompleted: boolean;

  @Expose()
  averageRating: number;
}

export class PublicNovelInListResponseDto {
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
  numberOfPublishedChapters: number;

  @Expose()
  @Transform(({ value }): string => value ?? '')
  description: string;

  @Expose()
  numberOfViews: number;

  @Expose()
  @Type(() => AuthorDto)
  author: AuthorDto;

  @Expose()
  @Type(() => GenreDto)
  genres: GenreDto[];

  @Expose()
  isCompleted: boolean;
}

export class PublicNovelResponseDto extends PublicNovelInListResponseDto {
  @Expose()
  numberOfReviews: number;

  @Expose()
  numberOfVotes: number;

  @Expose()
  averageRating: number;

  @Expose()
  @Transform(({ value }): Date | string => value ?? '')
  publishedAt: Date | null;

  @Expose()
  @Transform(({ value }): Date | string => value ?? '')
  completedAt: Date | null;
}

export class FullInfoNovelResponseDto extends PublicNovelResponseDto {
  @Expose()
  isPublished: boolean;

  @Expose()
  numberOfChapters: number;

  @Expose()
  createdAt: Date;

  @Expose()
  lastUpdatedAt: Date;

  @Expose()
  @Transform(({ value }): Date | string => value ?? '')
  deletedAt: Date | null;
}
