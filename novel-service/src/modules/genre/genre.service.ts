import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { Genre } from './genre.entity';
import { CreateGenreDto } from './dto/createGenre.dto';
import { UpdateGenreDto } from './dto/updateGenre.dto';
import { defaultPageNumber, defaultPageSize } from 'src/utils/constants';

@Injectable()
export class GenreService {
  constructor(
    @InjectRepository(Genre)
    private genreRepo: Repository<Genre>,
  ) {}

  async create(dto: CreateGenreDto): Promise<Genre> {
    const exists = await this.genreRepo.findOne({ where: { name: dto.name } });
    if (exists) {
      throw new RpcException({
        statusCode: HttpStatus.CONFLICT,
        message: `Thể loại truyện '${dto.name}' đã được thêm trước đó`,
      });
    }

    const genre = this.genreRepo.create(dto);
    return this.genreRepo.save(genre);
  }

  async findAll(query?: { page?: number; limit?: number; search?: string }) {
    const page = query?.page ? +query.page : defaultPageNumber;
    const limit = query?.limit ? +query.limit : defaultPageSize;
    const queryBuilder = this.genreRepo.createQueryBuilder('genre');

    if (query?.search) {
      const s = `%${query.search}%`;
      queryBuilder.where('genre.name LIKE :s', {
        s,
      });
    }

    const total = await queryBuilder.getCount();

    const data = await queryBuilder
      .orderBy('genre.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number): Promise<Genre> {
    const genre = await this.genreRepo.findOne({ where: { id } });
    if (!genre) {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Thể loại truyện với id ${id} không tồn tại`,
      });
    }
    return genre;
  }

  async update(id: number, dto: UpdateGenreDto): Promise<Genre> {
    const genre = await this.findOne(id);
    const exists = await this.genreRepo.findOne({ where: { name: dto.name } });
    if (exists && exists.id !== id) {
      throw new RpcException({
        statusCode: HttpStatus.CONFLICT,
        message: `Thể loại truyện '${dto.name}' đã được thêm trước đó`,
      });
    }

    Object.assign(genre, dto);
    return this.genreRepo.save(genre);
  }

  async delete(id: number): Promise<{ success: boolean }> {
    const genre = await this.findOne(id);
    await this.genreRepo.remove(genre);
    return { success: true };
  }
}
