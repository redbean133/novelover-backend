import {
  IsString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsInt,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CommentTargetType } from './queryComment.dto';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content: string;

  @IsEnum(CommentTargetType)
  targetType: CommentTargetType;

  @Type(() => Number)
  @IsInt()
  targetId: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  parentId?: number;
}
