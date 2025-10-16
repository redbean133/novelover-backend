import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/createComment.dto';
import { UpdateCommentDto } from './dto/updateComment.dto';
import { QueryCommentDto } from './dto/queryComment.dto';
import { QueryRepliesDto } from './dto/queryReplies.dto';

@Controller()
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @MessagePattern({ cmd: 'comment.create' })
  create(@Payload() payload: { dto: CreateCommentDto; currentUserId: string }) {
    return this.commentService.create(payload.dto, payload.currentUserId);
  }

  @MessagePattern({ cmd: 'comment.update' })
  update(
    @Payload()
    payload: {
      id: number;
      dto: UpdateCommentDto;
      currentUserId: string;
    },
  ) {
    return this.commentService.update(
      payload.id,
      payload.currentUserId,
      payload.dto.content,
    );
  }

  @MessagePattern({ cmd: 'comment.delete' })
  delete(@Payload() payload: { id: number; currentUserId: string }) {
    return this.commentService.delete(payload.id, payload.currentUserId);
  }

  @MessagePattern({ cmd: 'comment.find-all' })
  findAll(@Payload() payload: { queryDto: QueryCommentDto }) {
    return this.commentService.findAll(payload.queryDto);
  }

  @MessagePattern({ cmd: 'comment.find-all-replies' })
  findAllReplies(@Payload() payload: { queryDto: QueryRepliesDto }) {
    return this.commentService.findAllReplies(payload.queryDto);
  }
}
