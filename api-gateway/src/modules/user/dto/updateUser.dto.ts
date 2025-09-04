import {
  IsOptional,
  IsString,
  Length,
  IsEnum,
  IsDateString,
  IsUrl,
} from 'class-validator';
import { Gender } from '../interface/IUser';

export class UpdateUserDTO {
  @IsOptional()
  @IsString()
  @Length(3, 32)
  displayName?: string;

  @IsOptional()
  @IsString()
  @Length(8, 64)
  password?: string;

  @IsOptional()
  @IsDateString()
  birthday?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsString()
  about?: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @IsOptional()
  @IsUrl()
  coverUrl?: string;
}
