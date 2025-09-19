import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { GenreService } from './genre.service';
import { CreateGenreDto } from './dto/createGenre.dto';
import { UpdateGenreDto } from './dto/updateGenre.dto';

@Controller()
export class GenreController {
  constructor(private readonly genreService: GenreService) {}

  @MessagePattern({ cmd: 'genre.create' })
  create(@Payload() dto: CreateGenreDto) {
    return this.genreService.create(dto);
  }

  @MessagePattern({ cmd: 'genre.get-all' })
  getAll() {
    return this.genreService.getAll();
  }

  @MessagePattern({ cmd: 'genre.get-one-by-id' })
  getOneById(@Payload() id: number) {
    return this.genreService.getOneById(id);
  }

  @MessagePattern({ cmd: 'genre.update' })
  update(@Payload() payload: { id: number; data: UpdateGenreDto }) {
    return this.genreService.update(payload.id, payload.data);
  }

  @MessagePattern({ cmd: 'genre.delete' })
  delete(@Payload() id: number) {
    return this.genreService.delete(id);
  }
}
