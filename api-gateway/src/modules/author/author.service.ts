import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateAuthorDto } from './dto/createAuthor.dto';
import { UpdateAuthorDto } from './dto/updateAuthor.dto';
import { Observable } from 'rxjs';

@Injectable()
export class AuthorService {
  constructor(
    @Inject('NOVEL_SERVICE') private readonly novelClientProxy: ClientProxy,
  ) {}

  createAuthor(payload: CreateAuthorDto): Observable<any> {
    return this.novelClientProxy.send({ cmd: 'author.create' }, payload);
  }

  updateAuthor(payload: {
    id: number;
    data: UpdateAuthorDto;
  }): Observable<any> {
    return this.novelClientProxy.send({ cmd: 'author.update' }, payload);
  }

  deleteAuthor(id: number): Observable<any> {
    return this.novelClientProxy.send({ cmd: 'author.delete' }, { id });
  }

  findAll(payload: {
    page?: number;
    limit?: number;
    search?: string;
  }): Observable<any> {
    return this.novelClientProxy.send({ cmd: 'author.find-all' }, payload);
  }

  findOne(id: number): Observable<any> {
    return this.novelClientProxy.send({ cmd: 'author.find-one' }, { id });
  }
}
