/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class NovelService {
  constructor(
    @Inject('USER_SERVICE') private readonly userServiceClient: ClientProxy,
  ) {}

  private readonly novels = [
    {
      id: '1',
      title: 'The Hobbit',
      author: 'J.R.R. Tolkien',
      contributorID: '0WZBtrB2D9TinWNtoFKOtpeJ8Bw1',
    },
    {
      id: '2',
      title: '1984',
      author: 'George Orwell',
      contributorID: '0WZBtrB2D9TinWNtoFKOtpeJ8Bw1',
    },
  ];

  async findById(id: string) {
    const novel = this.novels.find((n) => n.id === id);
    if (!novel) throw new RpcException('Novel not found');

    const contributor = await firstValueFrom(
      this.userServiceClient.send(
        { cmd: 'get_user_email' },
        { uid: novel.contributorID },
      ),
    );

    console.log(contributor);
    return {
      id: novel.id,
      title: novel.title,
      author: novel.author,
      contributor: contributor,
    };
  }
}
