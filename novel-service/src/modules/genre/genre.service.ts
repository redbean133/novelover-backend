import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { Genre } from './genre.entity';
import { CreateGenreDto } from './dto/createGenre.dto';
import { UpdateGenreDto } from './dto/updateGenre.dto';
import { plainToInstance } from 'class-transformer';
import {
  GenreResponseDto,
  GenreWithoutDescriptionResponseDto,
} from './dto/genreResponse.dto';

@Injectable()
export class GenreService {
  constructor(
    @InjectRepository(Genre)
    private genreRepo: Repository<Genre>,
  ) {}

  async create(dto: CreateGenreDto): Promise<GenreResponseDto> {
    const exists = await this.genreRepo.findOne({ where: { name: dto.name } });
    if (exists) {
      throw new RpcException({
        statusCode: HttpStatus.CONFLICT,
        message: `Thể loại truyện '${dto.name}' đã được thêm trước đó`,
      });
    }

    const genre = this.genreRepo.create(dto);
    await this.genreRepo.save(genre);
    return plainToInstance(GenreResponseDto, genre, {
      excludeExtraneousValues: true,
    });
  }

  async getAll() {
    const genres = await this.genreRepo.find();
    return plainToInstance(GenreWithoutDescriptionResponseDto, genres, {
      excludeExtraneousValues: true,
    });
  }

  async getOneById(id: number): Promise<GenreResponseDto> {
    const genre = await this.genreRepo.findOne({ where: { id } });
    if (!genre) {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Thể loại truyện với id ${id} không tồn tại`,
      });
    }
    return plainToInstance(GenreResponseDto, genre, {
      excludeExtraneousValues: true,
    });
  }

  async getByIds(ids: number[]): Promise<Genre[]> {
    return this.genreRepo.findBy({
      id: In(ids),
    });
  }

  async update(id: number, dto: UpdateGenreDto): Promise<GenreResponseDto> {
    const genre = await this.getOneById(id);
    const exists = await this.genreRepo.findOne({ where: { name: dto.name } });
    if (exists && exists.id !== id) {
      throw new RpcException({
        statusCode: HttpStatus.CONFLICT,
        message: `Thể loại truyện '${dto.name}' đã được thêm trước đó`,
      });
    }

    Object.assign(genre, dto);
    return plainToInstance(GenreResponseDto, await this.genreRepo.save(genre), {
      excludeExtraneousValues: true,
    });
  }

  async delete(id: number): Promise<{ success: boolean }> {
    const genre = await this.genreRepo.findOne({ where: { id } });
    if (!genre) {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Không tìm thấy thể loại truyện cần xóa`,
      });
    }
    await this.genreRepo.remove(genre);
    return { success: true };
  }
}
