import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { AuthorService } from './author.service';

@Controller('/authors')
export class AuthorController {
  constructor(private readonly authorService: AuthorService) {}

  @Get('/suggestions')
  getSuggestions(@Query('name') name: string) {
    return firstValueFrom(this.authorService.getSuggestions(name));
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return firstValueFrom(this.authorService.getById(id));
  }
}
