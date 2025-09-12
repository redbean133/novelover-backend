import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsUrl,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';

export class CreateNovelDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsBoolean()
  isOriginal: boolean;

  @IsOptional()
  @IsInt()
  authorId?: number;

  @IsString()
  @IsNotEmpty()
  contributorId: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrl()
  coverUrl?: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'Tiểu thuyết phải thuộc ít nhất 1 thể loại' })
  @ArrayMaxSize(3, { message: 'Tiểu thuyết chỉ được chọn tối đa 3 thể loại' })
  @IsInt({ each: true })
  genreIds: number[];
}
