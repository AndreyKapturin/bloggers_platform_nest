import { Blog } from '../domain/blog.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginatedView } from '../../../../core/dto/PaginatedView.dto';
import { ViewBlogDto } from '../api/dto/Blog.view-dto';
import { BlogsQueryParamsDto } from '../api/dto/BlogQueryParams.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectRepository(Blog) private blogEntityRepository: Repository<Blog>,
  ) {}

  async find(query: BlogsQueryParamsDto): Promise<PaginatedView<ViewBlogDto>> {
    const {
      pageNumber,
      pageSize,
      searchNameTerm,
      skip,
      sortBy,
      sortDirection,
    } = query;

    const [blogs, totalCount] = await this.blogEntityRepository.findAndCount({
      where: {
        name: searchNameTerm ? ILike(`%${searchNameTerm}%`) : undefined,
      },
      order: { [sortBy]: sortDirection },
      take: pageSize,
      skip,
    });

    const viewBlogs = blogs.map((blog) => ViewBlogDto.toView(blog));
    const paginatedBlogs = PaginatedView.toView(
      pageNumber,
      pageSize,
      totalCount,
      viewBlogs,
    );
    return paginatedBlogs;
  }

  async findById(id: string): Promise<ViewBlogDto> {
    const blog = await this.blogEntityRepository.findOneBy({ id });

    if (!blog) {
      throw new NotFoundException(`Blog with id ${id} not found`);
    }

    return ViewBlogDto.toView(blog);
  }
}
