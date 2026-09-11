import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PaginatedView } from '../../../../core/dto/PaginatedView.dto';
import { PostsQueryParamsDto } from '../../posts/api/dto/PostQueryParams.dto';
import { ViewPostDto } from '../../posts/api/dto/ViewPost.dto';
import { QueryBus } from '@nestjs/cqrs';
import { GetPostsQuery } from '../../posts/application/queries/get-posts.query';
import { OptionalUserFromRequest } from '../../../../core/decorators/optional-user-in-request.decorator';
import { JwtOptionalAuthGuard } from '../../../user-accounts/auth/strategies/jwt/JwtOptional.guard';
import { UserInRequestDto } from '../../../../core/dto/UserInRequest.dto';
import { ViewBlogDto } from './dto/Blog.view-dto';
import { BlogsQueryParamsDto } from './dto/BlogQueryParams.dto';
import { GetBlogQuery } from '../application/queries/get-blog.query';
import { GetBlogsQuery } from '../application/queries/get-blogs.query';

@Controller('blogs')
export class BlogsController {
  constructor(
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
}
