import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { GenreService } from './genre.service';
import { CreateGenreDto } from './dto/createGenre.dto';
import { UpdateGenreDto } from './dto/updateGenre.dto';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { AdminGuard } from 'src/common/guard/admin.guard';

@Controller('/genres')
export class GenreController {
  constructor(private readonly genreService: GenreService) {}

  @UseGuards(AuthGuard, AdminGuard)
  @Post()
  create(@Body() dto: CreateGenreDto) {
    return this.genreService.createGenre(dto);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateGenreDto) {
    return this.genreService.updateGenre({ id, data: dto });
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.genreService.deleteGenre(id);
  }

  @Get(':id')
  getOneById(@Param('id', ParseIntPipe) id: number) {
    return this.genreService.getOneById(id);
  }

  @Get()
  getAll() {
    return this.genreService.getAll();
  }
}
