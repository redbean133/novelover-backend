import { IsString } from 'class-validator';

export class RefreshTokenDto {
  @IsString() userId: string;
  @IsString() deviceId: string;
  @IsString() refreshToken: string;
}
