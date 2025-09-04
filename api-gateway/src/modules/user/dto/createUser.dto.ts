import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 32)
  displayName: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 32)
  username: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 64)
  password: string;
}
