import { InjectModel } from '@nestjs/mongoose';
import { Blog } from '../domain/blog.entity';
import type { TBlogModel } from '../domain/blog.entity';
import { ViewBlogDto } from '../dto/Blog.view-dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { BlogsQueryParamsDto } from '../dto/BlogQueryParams.dto';
import { PaginatedView } from '../../../../core/dto/PaginatedView.dto';
import { QueryFilter } from 'mongoose';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: TBlogModel,
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

    const filter: QueryFilter<Blog> = {};

    if (searchNameTerm) {
      filter.name = { $regex: searchNameTerm, $options: 'i' };
    }

    const blogDocuments = await this.BlogModel.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize);

    const totalCount = await this.BlogModel.countDocuments(filter);

    const viewBlogs = blogDocuments.map((blogDocument) =>
      ViewBlogDto.toView(blogDocument),
    );
    const paginatedBlogs = PaginatedView.toView(
      pageNumber,
      pageSize,
      totalCount,
      viewBlogs,
    );
    return paginatedBlogs;
  }

  async findById(id: string): Promise<ViewBlogDto> {
    const foundBlogDocument = await this.BlogModel.findById(id);

    if (!foundBlogDocument) {
      throw new NotFoundException(`Blog with id ${id} not found`);
    }

    return ViewBlogDto.toView(foundBlogDocument);
  }
}
