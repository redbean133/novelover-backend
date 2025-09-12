import { PartialType } from '@nestjs/mapped-types';
import { CreateGenreDto } from './createGenre.dto';

export class UpdateGenreDto extends PartialType(CreateGenreDto) {}
