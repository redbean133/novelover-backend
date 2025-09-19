import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthorService } from './author.service';
import { CreateAuthorDto } from './dto/createAuthor.dto';

@Controller()
export class AuthorController {
  constructor(private readonly authorService: AuthorService) {}

  @MessagePattern({ cmd: 'author.get-by-id' })
  getById(@Payload() payload: { id: number }) {
    return this.authorService.getById(payload.id);
  }

  @MessagePattern({ cmd: 'author.create-if-not-exists' })
  createIfNotExists(@Payload() payload: CreateAuthorDto) {
    return this.authorService.createIfNotExists(payload);
  }

  @MessagePattern({ cmd: 'author.get-suggestions' })
  getSuggestions(@Payload() payload: { name: string; limit?: number }) {
    return this.authorService.getSuggestions(payload.name, payload.limit);
  }
}
