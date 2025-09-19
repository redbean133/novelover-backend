import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';

export class CreateNovelDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  title: string;

  @IsBoolean()
  isOriginal: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  authorName?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'Tiểu thuyết phải thuộc ít nhất 1 thể loại' })
  @ArrayMaxSize(3, { message: 'Tiểu thuyết chỉ được chọn tối đa 3 thể loại' })
  @IsInt({ each: true })
  genreIds: number[];
}
