import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAuthorDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  biography?: string;
}
