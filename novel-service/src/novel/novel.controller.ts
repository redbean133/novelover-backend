import { Controller } from '@nestjs/common';
import { NovelService } from './novel.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('novel')
export class NovelController {
  constructor(private readonly novelService: NovelService) {}

  @MessagePattern({ cmd: 'get_novel_detail' })
  getNovelDetail(@Payload() id: string) {
    return this.novelService.findById(id);
  }
}
