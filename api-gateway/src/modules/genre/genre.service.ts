import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateGenreDto } from './dto/createGenre.dto';
import { UpdateGenreDto } from './dto/updateGenre.dto';

@Injectable()
export class GenreService {
  constructor(
    @Inject('NOVEL_SERVICE') private readonly novelClient: ClientProxy,
  ) {}

  create(data: CreateGenreDto) {
    return this.novelClient.send({ cmd: 'genre.create' }, data);
  }

  update(payload: { id: number; data: UpdateGenreDto }) {
    return this.novelClient.send({ cmd: 'genre.update' }, payload);
  }

  delete(id: number) {
    return this.novelClient.send({ cmd: 'genre.delete' }, id);
  }

  findOne(id: number) {
    return this.novelClient.send({ cmd: 'genre.find-one' }, id);
  }

  findAll() {
    return this.novelClient.send({ cmd: 'genre.find-all' }, {});
  }
}
