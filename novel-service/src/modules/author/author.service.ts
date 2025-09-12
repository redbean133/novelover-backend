import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { Author } from './author.entity';
import { CreateAuthorDto } from './dto/createAuthor.dto';
import { UpdateAuthorDto } from './dto/updateAuthor.dto';
import { defaultPageNumber, defaultPageSize } from 'src/utils/constants';

@Injectable()
export class AuthorService {
  constructor(
    @InjectRepository(Author)
    private authorRepo: Repository<Author>,
  ) {}

  async create(dto: CreateAuthorDto): Promise<Author> {
    const exists = await this.authorRepo.findOne({ where: { name: dto.name } });
    if (exists) {
      throw new RpcException({
        statusCode: HttpStatus.CONFLICT,
        message: `Tác giả '${dto.name}' đã được thêm trước đó`,
      });
    }

    const author = this.authorRepo.create(dto);
    return this.authorRepo.save(author);
  }

  async findAll(query?: { page?: number; limit?: number; search?: string }) {
    const page = query?.page ? +query.page : defaultPageNumber;
    const limit = query?.limit ? +query.limit : defaultPageSize;
    const queryBuilder = this.authorRepo.createQueryBuilder('author');

    if (query?.search) {
      const s = `%${query.search}%`;
      queryBuilder.where('author.name LIKE :s', { s });
    }

    const total = await queryBuilder.getCount();

    queryBuilder
      .orderBy('author.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);
    const data = await queryBuilder.getMany();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number): Promise<Author> {
    const author = await this.authorRepo.findOne({ where: { id } });
    if (!author) {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Không tìm thấy tác giả`,
      });
    }
    return author;
  }

  async update(id: number, dto: UpdateAuthorDto): Promise<Author> {
    const author = await this.findOne(id);
    if (!author) {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Không tìm thấy tác giả cần cập nhật thông tin`,
      });
    }
    Object.assign(author, dto);
    return this.authorRepo.save(author);
  }

  async delete(id: number): Promise<{ success: boolean }> {
    const author = await this.findOne(id);
    if (!author) {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Không tìm thấy tác giả cần xóa`,
      });
    }
    await this.authorRepo.remove(author);
    return { success: true };
  }
}
