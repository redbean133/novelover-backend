import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';

@Injectable()
export class AuthorService {
  constructor(
    @Inject('NOVEL_SERVICE') private readonly novelClientProxy: ClientProxy,
  ) {}

  findOne(id: number): Observable<any> {
    return this.novelClientProxy.send({ cmd: 'author.find-one' }, { id });
  }

  getSuggestions(name: string): Observable<any> {
    return this.novelClientProxy.send(
      { cmd: 'author.get-suggestions' },
      { name },
    );
  }
}
