export interface PublicChapterResponseDto {
  id: number;
  title: string;
  novelId: number;
  novelTitle: string;
  totalChapters: number;
  content: string;
  numberOfViews: number;
  numberOfWords: number;
  numberOfVotes: number;
  prevChapterId: number;
  nextChapterId: number;
  publishedAt: Date | null;
  audioUrl: string;
  audioVersion: number;
  contentVersion: number;
}
