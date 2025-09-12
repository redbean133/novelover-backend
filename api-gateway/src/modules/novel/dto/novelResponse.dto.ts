export interface AuthorDto {
  id: number;
  name: string;
}

export interface GenreDto {
  id: number;
  name: string;
}

export interface NovelResponseDto {
  id: number;
  title: string;
  coverUrl: string;
  isOriginal: boolean;
  contributorId: string;
  numberOfChapters: number;
  numberOfPublishedChapters: number;
  numberOfReviews: number;
  numberOfVotes: number;
  numberOfViews: number;
  description: string;
  averageRating: number;
  isPublished: boolean;
  publishedAt: Date | string;
  completedAt: Date | string;
  createdAt: Date;
  lastUpdatedAt: Date;
  deletedAt: Date | string;
  author: AuthorDto;
  genres: GenreDto[];
}

export interface NovelResponseToClientDto extends NovelResponseDto {
  contributorName: string;
}
