import { Injectable } from '@nestjs/common';
import { Blog } from '../domain/blog.entity';
import {
  DomainException,
  DomainExceptionStatus,
} from '../../../../core/exceptions/DomainException';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DomainCreateBlogDto } from '../domain/dto/DomainCreateBlog.dto';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectRepository(Blog) private blogEntityRepository: Repository<Blog>,
  ) {}

  async findById(id: string): Promise<Blog | null> {
    return this.blogEntityRepository.findOneBy({ id });
  }

  async findByIdOrThrow(id: string): Promise<Blog> {
    const foundBlog = await this.findById(id);

    if (!foundBlog) {
      throw new DomainException(
        DomainExceptionStatus.NotFound,
        `Blog with id ${id} not found`,
        [
          {
            field: 'blogId',
            message: `Blog with id ${id} not found`,
          },
        ],
      );
    }

    return foundBlog;
  }

  async create(dto: DomainCreateBlogDto): Promise<Blog> {
    return this.blogEntityRepository.create(dto);
  }

  async save(blog: Blog): Promise<void> {
    await this.blogEntityRepository.save(blog);
  }

  async delete(blog: Blog): Promise<void> {
    await this.blogEntityRepository.remove(blog);
  }
}
