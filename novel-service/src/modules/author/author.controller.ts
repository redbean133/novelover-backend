import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthorService } from './author.service';
import { CreateAuthorDto } from './dto/createAuthor.dto';
import { UpdateAuthorDto } from './dto/updateAuthor.dto';

@Controller()
export class AuthorController {
  constructor(private readonly authorService: AuthorService) {}

  @MessagePattern({ cmd: 'author.create' })
  create(@Payload() dto: CreateAuthorDto) {
    return this.authorService.create(dto);
  }

  @MessagePattern({ cmd: 'author.find-all' })
  findAll(
    @Payload() query?: { page?: number; limit?: number; search?: string },
  ) {
    return this.authorService.findAll(query);
  }

  @MessagePattern({ cmd: 'author.find-one' })
  findOne(@Payload() payload: { id: number }) {
    return this.authorService.findOne(payload.id);
  }

  @MessagePattern({ cmd: 'author.update' })
  update(@Payload() payload: { id: number; data: UpdateAuthorDto }) {
    return this.authorService.update(payload.id, payload.data);
  }

  @MessagePattern({ cmd: 'author.delete' })
  delete(@Payload() payload: { id: number }) {
    return this.authorService.delete(payload.id);
  }
}
