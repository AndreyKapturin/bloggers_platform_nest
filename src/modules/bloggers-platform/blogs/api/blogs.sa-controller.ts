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
import { ViewPostDto } from '../../posts/api/dto/ViewPost.dto';
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
import { GetBlogsQuery } from '../application/queries/get-blogs.query';
import { GetPostQuery } from '../../posts/application/queries/get-post.query';
import { UpdateBlogCommand } from '../application/useCases/update-blog.use-case';
import { DeleteBlogCommand } from '../application/useCases/delete-blog.use-case';
import { CreatePostCommand } from '../../posts/application/useCases/create-post.use-case';
import { UpdatePostCommand } from '../../posts/application/useCases/update-post.use-case';
import { DeletePostCommand } from '../../posts/application/useCases/delete-post.use-case';
import { HttpCreateBlogPostDto } from '../../posts/api/dto/HttpCreateBlogPost.dto';
import { HttpUpdateBlogPostDto } from '../../posts/api/dto/HttpUpdateBlogPost.dto';

@Controller('sa/blogs')
@UseGuards(BasicAuthGuard)
export class SA_BlogsController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @Get()
  async getBlogs(
    @Query() queryParams: BlogsQueryParamsDto,
  ): Promise<PaginatedView<ViewBlogDto>> {
    return this.queryBus.execute(new GetBlogsQuery(queryParams));
  }

  @Post()
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

  @Post(':blogId/posts')
  async createPostForBlog(
    @Param('blogId') blogId: string,
    @Body() dto: HttpCreateBlogPostDto,
  ): Promise<ViewPostDto> {
    const command = new CreatePostCommand(
      blogId,
      dto.title,
      dto.shortDescription,
      dto.content,
    );
    const postId = await this.commandBus.execute(command);
    const query = new GetPostQuery(postId, null);
    return this.queryBus.execute(query);
  }

  @Put(':blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePostForBlog(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @Body() dto: HttpUpdateBlogPostDto,
  ): Promise<void> {
    const command = new UpdatePostCommand(
      postId,
      blogId,
      dto.title,
      dto.shortDescription,
      dto.content,
    );
    await this.commandBus.execute(command);
  }

  @Delete(':blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePostForBlog(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
  ): Promise<void> {
    const query = new GetBlogQuery(blogId);
    await this.queryBus.execute(query);
    const command = new DeletePostCommand(postId);
    await this.commandBus.execute(command);
  }

  @Put(':id')
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
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: string): Promise<void> {
    await this.commandBus.execute(new DeleteBlogCommand(id));
  }
}
