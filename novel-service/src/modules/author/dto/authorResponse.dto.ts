import { Expose, Transform } from 'class-transformer';

export class AuthorResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  @Transform(({ value }): string => value ?? '')
  biography: string;
}
