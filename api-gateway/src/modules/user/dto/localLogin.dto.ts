import { IsOptional, IsString } from 'class-validator';

export class LocalLoginDto {
  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  deviceId?: string;
}
