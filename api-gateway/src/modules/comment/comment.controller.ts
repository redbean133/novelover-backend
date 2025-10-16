import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from 'src/common/guard/auth.guard';
import type { IRequestWithUser } from 'src/common/interface/IRequestWithUser';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/createComment.dto';
import { UpdateCommentDto } from './dto/updateComment.dto';
import { CommentTargetType } from './dto/queryComment.dto';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() dto: CreateCommentDto, @Req() req: IRequestWithUser) {
    return this.commentService.create({ dto, currentUserId: req.user.sub });
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCommentDto,
    @Req() req: IRequestWithUser,
  ) {
    return this.commentService.update({ id, dto, currentUserId: req.user.sub });
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number, @Req() req: IRequestWithUser) {
    return this.commentService.delete({ id, currentUserId: req.user.sub });
  }

  @Get()
  findAll(
    @Query('targetType') targetType: CommentTargetType,
    @Query('targetId', ParseIntPipe) targetId: number,
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('repliesLimit', ParseIntPipe) repliesLimit: number,
  ) {
    return this.commentService.findAll({
      targetType,
      targetId,
      page,
      limit,
      repliesLimit,
    });
  }

  @Get(':id/replies')
  findAllReplies(
    @Param('id', ParseIntPipe) commentId: number,
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
  ) {
    return this.commentService.findAllReplies({ commentId, page, limit });
  }
}
