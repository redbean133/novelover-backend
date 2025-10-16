export interface IUserInfo {
  id: string;
  displayName: string;
  avatarUrl: string;
  username: string;
}

export interface ICommentResponseToClient {
  id: number;
  content: string;
  targetType: 'novel' | 'chapter';
  targetId: number;
  rootId: number | null;
  repliesCount: number;
  likesCount: number;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;

  author: IUserInfo;
  authorOfParentComment?: IUserInfo;
  replies?: ICommentResponseToClient[];
  hasMoreReplies?: boolean;
}
