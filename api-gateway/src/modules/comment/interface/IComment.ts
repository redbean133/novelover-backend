export interface IComment {
  id: number;
  userId: string;
  content: string;
  targetType: 'novel' | 'chapter';
  targetId: number;
  rootId: number | null;
  repliesCount: number;
  likesCount: number;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;

  parent?: IComment;
  replies: IComment[];
  hasMoreReplies?: boolean;
}
