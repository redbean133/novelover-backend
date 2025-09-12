import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateGenreDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}
