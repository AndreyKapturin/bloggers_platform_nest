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
import { BlogsQueryRepository } from '../infrastructure/blogs.query-repository';
import { PaginatedView } from '../../../../core/dto/PaginatedView.dto';
import { PostsQueryParamsDto } from '../../posts/api/dto/PostQueryParams.dto';
import { PostsService } from '../../posts/application/posts.service';
import { PostsQueryRepository } from '../../posts/infrastructure/Post.query-repository';
import { ViewPostDto } from '../../posts/api/dto/VIewPost.dto';
import { BlogPostDtoExtractor } from '../decorators/blog-post-dto-extractor.decorator';
import { BasicAuthGuard } from '../../../user-accounts/auth/strategies/basic/Basic.guard';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetPostsQuery } from '../../posts/application/queries/get-posts.query';
import { OptionalUserFromRequest } from '../../../user-accounts/auth/decorators/optional-user-in-request.decorator';
import { JwtOptionalAuthGuard } from '../../../user-accounts/auth/strategies/jwt/JwtOptional.guard';
import { UserInRequestDto } from '../../../../core/dto/UserInRequest.dto';
import { HttpCreateBlogDto } from './dto/HttpCreateBlog.dto';
import { CreateBlogCommand } from '../application/useCases/create-blog.use-case';
import { ViewBlogDto } from './dto/Blog.view-dto';
import { BlogsQueryParamsDto } from './dto/BlogQueryParams.dto';
import { GetBlogQuery } from '../application/queries/get-blog.query';
import { HttpUpdateBlogDto } from './dto/HttpUpdateBlog.dto';
import { HttpCreatePostDto } from '../../posts/api/dto/HttpCreatePost.dto';

@Controller('blogs')
export class BlogsController {
  constructor(
    private blogsService: BlogsService,
    private blogsQueryRepository: BlogsQueryRepository,
    private postsServise: PostsService,
    private postsQueryRepository: PostsQueryRepository,
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @Get(':id')
  async getBlogById(@Param('id') id: string): Promise<ViewBlogDto> {
    const query = new GetBlogQuery(id);
    return this.queryBus.execute(query);
  }

  @Get(':id/posts')
  @UseGuards(JwtOptionalAuthGuard)
  async getBlogPosts(
    @Param('id') blogId: string,
    @Query() postsQueryParamsDto: PostsQueryParamsDto,
    @OptionalUserFromRequest() user: UserInRequestDto | null,
  ): Promise<PaginatedView<ViewPostDto>> {
    const query = new GetPostsQuery(
      postsQueryParamsDto,
      user?.id ?? null,
      blogId,
    );

    return this.queryBus.execute(query);
  }

  @Get()
  async getBlogs(
    @Query() query: BlogsQueryParamsDto,
  ): Promise<PaginatedView<ViewBlogDto>> {
    return await this.blogsQueryRepository.find(query);
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  async createBlog(@Body() dto: HttpCreateBlogDto): Promise<ViewBlogDto> {
    const command = new CreateBlogCommand(
      dto.name,
      dto.description,
      dto.websiteUrl,
    );
    const blogId = await this.commandBus.execute(command);
    return await this.blogsQueryRepository.findById(blogId);
  }

  @Post(':blogId/posts')
  @UseGuards(BasicAuthGuard)
  async createPostForBlog(
    @BlogPostDtoExtractor() dto: HttpCreatePostDto,
  ): Promise<ViewPostDto> {
    await this.blogsQueryRepository.findById(dto.blogId);
    const postId = await this.postsServise.createPost(dto);
    return this.postsQueryRepository.findById(postId);
  }

  @Put(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('id') id: string,
    @Body() inputUpdateBlogDto: HttpUpdateBlogDto,
  ): Promise<ViewBlogDto> {
    await this.blogsService.updateBlog(id, inputUpdateBlogDto);
    return await this.blogsQueryRepository.findById(id);
  }

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: string): Promise<void> {
    await this.blogsService.deleteBlog(id);
  }
}
