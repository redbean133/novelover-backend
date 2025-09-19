import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { Author } from './author.entity';
import { CreateAuthorDto } from './dto/createAuthor.dto';
import { plainToInstance } from 'class-transformer';
import { AuthorResponseDto } from './dto/authorResponse.dto';

@Injectable()
export class AuthorService {
  constructor(
    @InjectRepository(Author)
    private authorRepo: Repository<Author>,
  ) {}

  async getById(id: number): Promise<AuthorResponseDto> {
    const author = await this.authorRepo.findOne({ where: { id } });
    if (!author) {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Không tìm thấy tác giả`,
      });
    }
    return plainToInstance(AuthorResponseDto, author, {
      excludeExtraneousValues: true,
    });
  }

  async createIfNotExists({
    name,
    biography,
  }: CreateAuthorDto): Promise<Author> {
    let author = await this.authorRepo.findOne({ where: { name } });
    if (!author) {
      author = this.authorRepo.create({ name, biography });
      await this.authorRepo.save(author);
    }
    return author;
  }

  async getSuggestions(keyword: string, limit = 5): Promise<string[]> {
    const authors = await this.authorRepo
      .createQueryBuilder('author')
      .where('author.name ILIKE :keyword', { keyword: `%${keyword}%` })
      .orderBy('author.name', 'ASC')
      .take(limit)
      .getMany();

    return authors.map((author) => author.name);
  }
}
