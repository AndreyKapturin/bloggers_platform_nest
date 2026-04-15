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
  UseGuards,
} from '@nestjs/common';
import { BlogsService } from '../application/blogs.service';
import { InputCreateBlogDto } from '../dto/Blog.input-create-dto';
import { BlogsQueryRepository } from '../infrastructure/blogs.query-repository';
import { ViewBlogDto } from '../dto/Blog.view-dto';
import { BlogsQueryParamsDto } from '../dto/BlogQueryParams.dto';
import { PaginatedView } from '../../../../core/dto/PaginatedView.dto';
import { InputUpdateBlogDto } from '../dto/Blog.input-update-dto';
import { PostsQueryParamsDto } from '../../posts/dto/PostQueryParams.dto';
import { PostsService } from '../../posts/application/posts.service';
import { PostsQueryRepository } from '../../posts/infrastructure/Post.query-repository';
import { ViewPostDto } from '../../posts/dto/Post.view-dto';
import { InputCreatePostDto } from '../../posts/dto/Post.input-create-dto';
import { BlogPostDtoExtractor } from '../decorators/blog-post-dto-extractor.decorator';
import { BasicAuthGuard } from '../../../user-accounts/auth/strategies/basic/Basic.guard';

@Controller('blogs')
export class BlogsController {
  constructor(
    private blogsService: BlogsService,
    private blogsQueryRepository: BlogsQueryRepository,
    private postsServise: PostsService,
    private postsQueryRepository: PostsQueryRepository,
  ) {}

  @Get(':id')
  async getBlogById(@Param('id') id: string): Promise<ViewBlogDto> {
    return await this.blogsQueryRepository.findById(id);
  }

  @Get(':id/posts')
  async getBlogPosts(
    @Param('id') blogId: string,
    @Query() postsQueryParamsDto: PostsQueryParamsDto,
  ): Promise<PaginatedView<ViewPostDto>> {
    await this.blogsQueryRepository.findById(blogId);
    return this.postsQueryRepository.findForBlog(blogId, postsQueryParamsDto);
  }

  @Get()
  async getBlogs(
    @Query() query: BlogsQueryParamsDto,
  ): Promise<PaginatedView<ViewBlogDto>> {
    return await this.blogsQueryRepository.find(query);
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  async createBlog(
    @Body() inputCreateBlogDto: InputCreateBlogDto,
  ): Promise<ViewBlogDto> {
    const blogId = await this.blogsService.createBlog(inputCreateBlogDto);
    return await this.blogsQueryRepository.findById(blogId);
  }

  @Post(':blogId/posts')
  @UseGuards(BasicAuthGuard)
  async createPostForBlog(
    @BlogPostDtoExtractor() inputCreatePostDto: InputCreatePostDto,
  ): Promise<ViewPostDto> {
    await this.blogsQueryRepository.findById(inputCreatePostDto.blogId);
    const postId = await this.postsServise.createPost(inputCreatePostDto);
    return this.postsQueryRepository.findById(postId);
  }

  @Put(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('id') id: string,
    @Body() inputUpdateBlogDto: InputUpdateBlogDto,
  ): Promise<ViewBlogDto> {
    await this.blogsService.updateBlog(id, inputUpdateBlogDto);
    return await this.blogsQueryRepository.findById(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: string): Promise<void> {
    await this.blogsService.deleteBlog(id);
  }
}
