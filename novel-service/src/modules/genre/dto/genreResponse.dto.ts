import { Expose, Transform } from 'class-transformer';

export class GenreWithoutDescriptionResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;
}

export class GenreResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  @Transform(({ value }): string => value ?? '')
  description: string;
}
