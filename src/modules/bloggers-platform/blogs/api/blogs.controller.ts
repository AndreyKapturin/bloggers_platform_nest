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
import { PaginatedView } from '../../../../core/dto/PaginatedView.dto';
import { PostsQueryParamsDto } from '../../posts/api/dto/PostQueryParams.dto';
import { PostsService } from '../../posts/application/posts.service';
import { ViewPostDto } from '../../posts/api/dto/VIewPost.dto';
import { BlogPostDtoExtractor } from '../decorators/blog-post-dto-extractor.decorator';
import { BasicAuthGuard } from '../../../user-accounts/auth/strategies/basic/Basic.guard';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetPostsQuery } from '../../posts/application/queries/get-posts.query';
import { OptionalUserFromRequest } from '../../../../core/decorators/optional-user-in-request.decorator';
import { JwtOptionalAuthGuard } from '../../../user-accounts/auth/strategies/jwt/JwtOptional.guard';
import { UserInRequestDto } from '../../../../core/dto/UserInRequest.dto';
import { HttpCreateBlogDto } from './dto/HttpCreateBlog.dto';
import { CreateBlogCommand } from '../application/useCases/create-blog.use-case';
import { ViewBlogDto } from './dto/Blog.view-dto';
import { BlogsQueryParamsDto } from './dto/BlogQueryParams.dto';
import { GetBlogQuery } from '../application/queries/get-blog.query';
import { HttpUpdateBlogDto } from './dto/HttpUpdateBlog.dto';
import { HttpCreatePostDto } from '../../posts/api/dto/HttpCreatePost.dto';
import { GetBlogsQuery } from '../application/queries/get-blogs.query';
import { GetPostQuery } from '../../posts/application/queries/get-post.query';
import { UpdateBlogCommand } from '../application/useCases/update-blog.use-case';
import { DeleteBlogCommand } from '../application/useCases/delete-blog.use-case';

@Controller('blogs')
export class BlogsController {
  constructor(
    private postsServise: PostsService,
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
    @OptionalUserFromRequest() dto: UserInRequestDto | null,
  ): Promise<PaginatedView<ViewPostDto>> {
    const query = new GetPostsQuery(
      postsQueryParamsDto,
      dto?.userId ?? null,
      blogId,
    );

    return this.queryBus.execute(query);
  }

  @Get()
  async getBlogs(
    @Query() queryParams: BlogsQueryParamsDto,
  ): Promise<PaginatedView<ViewBlogDto>> {
    return this.queryBus.execute(new GetBlogsQuery(queryParams));
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
    const query = new GetBlogQuery(blogId);
    return this.queryBus.execute(query);
  }

  @Post(':blogId/posts')
  @UseGuards(BasicAuthGuard)
  async createPostForBlog(
    @BlogPostDtoExtractor() dto: HttpCreatePostDto,
  ): Promise<ViewPostDto> {
    const postId = await this.postsServise.createPost(dto);
    const query = new GetPostQuery(postId, null);
    return this.queryBus.execute(query);
  }

  @Put(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('id') id: string,
    @Body() dto: HttpUpdateBlogDto,
  ): Promise<void> {
    const command = new UpdateBlogCommand(
      id,
      dto.name,
      dto.description,
      dto.websiteUrl,
    );
    await this.commandBus.execute(command);
  }

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: string): Promise<void> {
    await this.commandBus.execute(new DeleteBlogCommand(id));
  }
}
