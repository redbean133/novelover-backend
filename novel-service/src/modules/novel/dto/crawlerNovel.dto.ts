import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  IsUrl,
} from 'class-validator';

export class CrawlerNovelDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  title: string;

  @IsString()
  @MaxLength(64)
  authorName?: string;

  @IsString()
  @IsNotEmpty()
  contributorId: string;

  @IsString()
  description?: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'Tiểu thuyết phải thuộc ít nhất 1 thể loại' })
  @ArrayMaxSize(3, { message: 'Tiểu thuyết chỉ được chọn tối đa 3 thể loại' })
  @IsString({ each: true })
  genres: string[];

  @IsUrl()
  @IsOptional()
  coverUrl?: string;
}
