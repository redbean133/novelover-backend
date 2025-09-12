import { PartialType } from '@nestjs/mapped-types';
import { CreateAuthorDto } from './createAuthor.dto';

export class UpdateAuthorDto extends PartialType(CreateAuthorDto) {}
