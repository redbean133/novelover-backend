export interface IReview {
  id: number;
  novelId: number;
  userId: string;
  rating: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}
