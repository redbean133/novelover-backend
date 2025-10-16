import { Author } from './author.entity';
import { GenreWithoutDescription } from './genre.entity';

export interface PublicNovelInList {
  id: number;
  title: string;
  coverUrl: string;
  isOriginal: boolean;
  contributorId: string;
  numberOfPublishedChapters: number;
  description: string;
  numberOfViews: number;
  author: Author;
  genres: GenreWithoutDescription[];
  isCompleted: boolean;
  contributorName?: string;
}

export interface PublicNovel extends PublicNovelInList {
  numberOfReviews: number;
  numberOfVotes: number;
  averageRating: string;
  publishedAt: Date | string;
  completedAt: Date | string;
}

export interface FullInfoNovel extends PublicNovel {
  isPublished: boolean;
  numberOfChapters: number;
  createdAt: Date | string;
  lastUpdatedAt: Date | string;
  deletedAt: Date | string;
}
