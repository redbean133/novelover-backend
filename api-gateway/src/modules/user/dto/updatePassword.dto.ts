import { IsNotEmpty, IsString, Length } from 'class-validator';

export class UpdatePasswordDto {
  @IsString()
  @IsNotEmpty()
  @Length(8, 64)
  currentPassword: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 64)
  newPassword: string;
}
