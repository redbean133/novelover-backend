import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { CreateCommentDto } from './dto/createComment.dto';
import { QueryCommentDto } from './dto/queryComment.dto';
import { QueryRepliesDto } from './dto/queryReplies.dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
  ) {}

  async create(createCommentDto: CreateCommentDto, userId: string) {
    const { content, targetType, targetId, parentId } = createCommentDto;

    let rootId: number | null = null;
    let parent: Comment | null = null;

    if (parentId) {
      parent = await this.commentRepository.findOne({
        where: { id: parentId },
      });

      if (
        !parent ||
        parent.targetType !== targetType ||
        parent.targetId !== targetId
      ) {
        throw new RpcException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Không tìm thấy bình luận cần trả lời',
        });
      }

      // Determine rootId: if parent has rootId, use it
      // Otherwise, parent is the root
      rootId = parent.rootId || parent.id;
      // Update repliesCount of ROOT comment
      await this.commentRepository.increment({ id: rootId }, 'repliesCount', 1);
    }

    const comment = this.commentRepository.create({
      userId,
      content,
      targetType,
      targetId,
      parentId,
      rootId,
    });
    const savedComment = await this.commentRepository.save(comment);

    // Attach parent info
    if (parent) {
      savedComment.parent = parent;
    }
    return savedComment;
  }

  async findAll(queryDto: QueryCommentDto): Promise<{
    data: Comment[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      targetType,
      targetId,
      page = 1,
      limit = 12,
      repliesLimit = 3,
    } = queryDto;

    // Query root comments
    const [rootComments, total] = await this.commentRepository.findAndCount({
      where: {
        targetType,
        targetId,
        parentId: IsNull(),
      },
      order: {
        createdAt: 'DESC',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Load limited replies for each root comment
    // Get all replies at all level but flatten to 1 list
    for (const rootComment of rootComments) {
      const replies = await this.commentRepository
        .createQueryBuilder('comment')
        .leftJoinAndSelect('comment.parent', 'parent')
        .where('comment.rootId = :rootId', { rootId: rootComment.id })
        .orderBy('comment.createdAt', 'ASC')
        .limit(repliesLimit)
        .getMany();

      rootComment.replies = replies;
      rootComment.hasMoreReplies = rootComment.repliesCount > repliesLimit;
    }

    return {
      data: rootComments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findAllReplies(queryDto: QueryRepliesDto): Promise<{
    data: Comment[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { commentId, page = 1, limit = 12 } = queryDto;

    const rootComment = await this.commentRepository.findOne({
      where: { id: commentId },
    });

    if (!rootComment) {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Không tìm thấy bình luận',
      });
    }

    // Get all replies of this root comment (flatten all levels)
    const rootId = rootComment.rootId || rootComment.id;
    const [replies, total] = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.parent', 'parent')
      .where('comment.rootId = :rootId', { rootId })
      .orderBy('comment.createdAt', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: replies,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id: number, userId: string, content: string): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id },
    });

    if (!comment) {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Không tìm thấy bình luận',
      });
    }

    if (comment.userId !== userId) {
      throw new RpcException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Bạn chỉ có thể sửa bình luận của mình',
      });
    }

    comment.content = content;
    comment.isEdited = true;

    return await this.commentRepository.save(comment);
  }

  async delete(id: number, userId: string): Promise<{ success: boolean }> {
    const comment = await this.commentRepository.findOne({
      where: { id },
    });

    if (!comment) {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Không tìm thấy bình luận',
      });
    }

    if (comment.userId !== userId) {
      throw new RpcException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Bạn chỉ có thể xóa bình luận của mình',
      });
    }

    await this.commentRepository.remove(comment);

    // decrement repliesCount of root comment if applicable
    if (comment.rootId) {
      await this.commentRepository.decrement(
        { id: comment.rootId },
        'repliesCount',
        1,
      );
    }

    return { success: true };
  }

  async getComment(id: number): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['parent'],
    });

    if (!comment) {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Không tìm thấy bình luận',
      });
    }

    return comment;
  }
}
