export interface AuthorDto {
  id: number;
  name: string;
}

export interface GenreDto {
  id: number;
  name: string;
}

export interface MyNovelInListResponseDto {
  id: number;
  title: string;
  coverUrl: string;
  isOriginal: boolean;
  numberOfPublishedChapters: number;
  numberOfChapters: number;
  numberOfViews: number;
  author: AuthorDto;
  isCompleted: boolean;
  averageRating: number;
}

export interface PublicNovelInListResponseDto {
  id: number;
  title: string;
  coverUrl: string;
  isOriginal: boolean;
  contributorId: string;
  numberOfPublishedChapters: number;
  description: string;
  numberOfViews: number;
  author: AuthorDto;
  genres: GenreDto[];
  isCompleted: boolean;
  contributorName?: string;
}

export interface PublicNovelResponseDto extends PublicNovelInListResponseDto {
  numberOfReviews: number;
  numberOfVotes: number;
  averageRating: number;
  publishedAt: Date | string;
  completedAt: Date | string;
}

export interface FullInfoNovelResponseDto extends PublicNovelResponseDto {
  isPublished: boolean;
  numberOfChapters: number;
  createdAt: Date | string;
  lastUpdatedAt: Date | string;
  deletedAt: Date | string;
}

export interface NovelsListResponseDto {
  data: MyNovelInListResponseDto[] | PublicNovelInListResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
