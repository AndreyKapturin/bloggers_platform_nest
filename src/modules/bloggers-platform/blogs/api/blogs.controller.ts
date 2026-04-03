import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { BlogsService } from '../application/blogs.service';
import { InputCreateBlogDto } from '../dto/Blog.input-create-dto';
import { BlogsQueryRepository } from '../infrastructure/blogs.query-repository';
import { ViewBlogDto } from '../dto/Blog.view-dto';
import { BlogsQueryParamsDto } from '../dto/BlogQueryParams.dto';
import { PaginatedView } from 'src/core/dto/PaginatedView.dto';
import { InputUpdateBlogDto } from '../dto/Blog.input-update-dto';

@Controller('blogs')
export class BlogsController {
  constructor(
    private blogsService: BlogsService,
    private blogsQueryRepository: BlogsQueryRepository,
  ) {}

  @Get(':id')
  async getBlogById(@Param('id') id: string): Promise<ViewBlogDto> {
    return await this.blogsQueryRepository.findById(id);
  }

  @Get()
  async getBlogs(
    @Query() query: BlogsQueryParamsDto,
  ): Promise<PaginatedView<ViewBlogDto>> {
    return await this.blogsQueryRepository.find(query);
  }

  @Post()
  async createBlog(
    @Body() inputCreateBlogDto: InputCreateBlogDto,
  ): Promise<ViewBlogDto> {
    const blogId = await this.blogsService.createBlog(inputCreateBlogDto);
    return await this.blogsQueryRepository.findById(blogId);
  }

  @Put(':id')
  async updateBlog(
    @Param('id') id: string,
    @Body() inputUpdateBlogDto: InputUpdateBlogDto,
  ): Promise<ViewBlogDto> {
    await this.blogsService.updateBlog(id, inputUpdateBlogDto);
    return await this.blogsQueryRepository.findById(id);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deleteBlog(@Param('id') id: string): Promise<void> {
    await this.blogsService.deleteBlog(id);
  }
}
