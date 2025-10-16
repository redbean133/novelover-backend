export interface MyChapter {
  id: number;
  title: string;
  novelId: number;
  novelTitle: string;
  content: string;
  numberOfWords: number;
  isPublished: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}
