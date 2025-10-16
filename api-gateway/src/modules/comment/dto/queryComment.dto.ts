import { IsEnum, IsInt, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum CommentTargetType {
  NOVEL = 'novel',
  CHAPTER = 'chapter',
}

export class QueryCommentDto {
  @IsEnum(CommentTargetType)
  targetType: CommentTargetType;

  @Type(() => Number)
  @IsInt()
  targetId: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 12;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  repliesLimit?: number = 3;
}
