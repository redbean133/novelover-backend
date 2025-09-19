import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateGenreDto } from './dto/createGenre.dto';
import { UpdateGenreDto } from './dto/updateGenre.dto';

@Injectable()
export class GenreService {
  constructor(
    @Inject('NOVEL_SERVICE') private readonly novelClient: ClientProxy,
  ) {}

  createGenre(data: CreateGenreDto) {
    return this.novelClient.send({ cmd: 'genre.create' }, data);
  }

  updateGenre(payload: { id: number; data: UpdateGenreDto }) {
    return this.novelClient.send({ cmd: 'genre.update' }, payload);
  }

  deleteGenre(id: number) {
    return this.novelClient.send({ cmd: 'genre.delete' }, id);
  }

  getOneById(id: number) {
    return this.novelClient.send({ cmd: 'genre.get-one-by-id' }, id);
  }

  getAll() {
    return this.novelClient.send({ cmd: 'genre.get-all' }, {});
  }
}
