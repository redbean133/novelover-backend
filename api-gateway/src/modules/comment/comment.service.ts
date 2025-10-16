import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { UserService } from '../user/user.service';
import { CreateCommentDto } from './dto/createComment.dto';
import { IComment } from './interface/IComment';
import { UpdateCommentDto } from './dto/updateComment.dto';
import { QueryCommentDto } from './dto/queryComment.dto';
import { QueryRepliesDto } from './dto/queryReplies.dto';
import {
  ICommentResponseToClient,
  IUserInfo,
} from './interface/ICommentResponseToClient';

@Injectable()
export class CommentService {
  constructor(
    @Inject('NOVEL_SERVICE') private client: ClientProxy,
    private readonly userService: UserService,
  ) {}

  async create(payload: { dto: CreateCommentDto; currentUserId: string }) {
    return firstValueFrom<IComment>(
      this.client.send({ cmd: 'comment.create' }, payload),
    );
  }

  async update(payload: {
    id: number;
    dto: UpdateCommentDto;
    currentUserId: string;
  }) {
    return firstValueFrom<IComment>(
      this.client.send({ cmd: 'comment.update' }, payload),
    );
  }

  async delete(payload: { id: number; currentUserId: string }) {
    return firstValueFrom<{ success: boolean }>(
      this.client.send({ cmd: 'comment.delete' }, payload),
    );
  }

  async findAll(queryDto: QueryCommentDto) {
    const { data, total, page, limit, totalPages } = await firstValueFrom<{
      data: IComment[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(this.client.send({ cmd: 'comment.find-all' }, { queryDto }));

    if (!data.length) return { data: [], total, page, limit, totalPages };

    const userIds = this.extractUserIds(data);
    const users = await firstValueFrom(this.userService.getUsersByIds(userIds));
    const userMap = new Map(
      users.map((user) => [
        user.id,
        {
          id: user.id,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          username: user.username,
        },
      ]),
    );

    const commentsWithUserInfo = this.mapUserInfo(data, userMap);
    return { data: commentsWithUserInfo, total, page, limit, totalPages };
  }

  async findAllReplies(queryDto: QueryRepliesDto) {
    const { data, total, page, limit, totalPages } = await firstValueFrom<{
      data: IComment[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(this.client.send({ cmd: 'comment.find-all-replies' }, { queryDto }));
    if (!data.length) return { data: [], total, page, limit, totalPages };

    const userIds = this.extractUserIds(data);
    const users = await firstValueFrom(this.userService.getUsersByIds(userIds));
    const userMap = new Map(
      users.map((user) => [
        user.id,
        {
          id: user.id,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          username: user.username,
        },
      ]),
    );

    const commentsWithUserInfo = this.mapUserInfo(data, userMap);
    return { data: commentsWithUserInfo, total, page, limit, totalPages };
  }

  private extractUserIds(comments: IComment[]): string[] {
    const userIds = new Set<string>();

    comments.forEach((comment) => {
      userIds.add(comment.userId);

      if (comment.parent) {
        userIds.add(comment.parent.userId);
      }

      if (comment.replies) {
        comment.replies.forEach((reply) => {
          userIds.add(reply.userId);
          if (reply.parent) {
            userIds.add(reply.parent.userId);
          }
        });
      }
    });

    return Array.from(userIds);
  }

  private mapUserInfo(
    comments: IComment[],
    usersMap: Map<string, IUserInfo>,
  ): ICommentResponseToClient[] {
    return comments.map((comment) => {
      return {
        id: comment.id,
        content: comment.content,
        targetType: comment.targetType,
        targetId: comment.targetId,
        rootId: comment.rootId,
        repliesCount: comment.repliesCount,
        likesCount: comment.likesCount,
        isEdited: comment.isEdited,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,

        author: usersMap.get(comment.userId) ?? {
          id: 'unknown',
          displayName: 'Unknown User',
          avatarUrl: '',
          username: 'unknown',
        },
        ...(comment.parent
          ? { authorOfParentComment: usersMap.get(comment.parent.userId) }
          : {}),
        ...(comment.replies && comment.replies.length > 0
          ? { replies: this.mapUserInfo(comment.replies, usersMap) }
          : {}),
        hasMoreReplies: comment.hasMoreReplies,
      };
    });
  }
}
