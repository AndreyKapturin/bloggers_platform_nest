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
import { ViewPostDto } from './dto/VIewPost.dto';
import { PostsService } from '../application/posts.service';
import { PostsQueryRepository } from '../infrastructure/Post.query-repository';
import { PostsQueryParamsDto } from './dto/PostQueryParams.dto';
import { PaginatedView } from '../../../../core/dto/PaginatedView.dto';
import { CommentsQueryParamsDto } from '../../comments/api/dto/CommentsQueryParams.dto';
import { CommentsQueryRepository } from '../../comments/infrastructure/Comments.query-repository';
import { ViewCommentDto } from '../../comments/api/dto/ViewComment.dto';
import { BasicAuthGuard } from '../../../user-accounts/auth/strategies/basic/Basic.guard';
import { JwtAuthGuard } from '../../../user-accounts/auth/strategies/jwt/Jwt.guard';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateCommentCommand } from '../../comments/application/useCases/create-comment.use-case';
import { HttpCommentDto } from '../../comments/api/dto/HttpComment.dto';
import { ExtractUserFromRequest } from '../../../user-accounts/auth/decorators/extract-userId.decorator';
import { UserInRequest } from '../../../user-accounts/auth/dto/UserInRequest.dto';
import { JwtOptionalAuthGuard } from '../../../user-accounts/auth/strategies/jwt/JwtOptional.guard';
import { OptionalUserFromRequest } from '../../../user-accounts/auth/decorators/optional-user-in-request.decorator';
import { GetPostCommentsQuery } from '../../comments/application/queries/get-comments-for-post.query';
import { HttpLikeStatusDto } from '../../dto/HttpLikeStatus.dto';
import { LikePostCommand } from '../application/useCases/like-post.use-case';
import { GetPostQuery } from '../application/queries/get-post.query';
import { GetPostsQuery } from '../application/queries/get-posts.query';
import { HttpCreatePostDto } from './dto/HttpCreatePost.dto';
import { HttpUpdatePostDto } from './dto/HttpUpdatePost.dto';

@Controller('posts')
export class PostsController {
  constructor(
    private postsService: PostsService,
    private postsQueryRepository: PostsQueryRepository,
    private commentsQueryRepository: CommentsQueryRepository,
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @Get(':id')
  @UseGuards(JwtOptionalAuthGuard)
  async getById(
    @Param('id') id: string,
    @OptionalUserFromRequest() user: UserInRequest | null,
  ): Promise<ViewPostDto> {
    const query = new GetPostQuery(id, user?.id ?? null);
    return this.queryBus.execute(query);
  }

  @Get(':id/comments')
  @UseGuards(JwtOptionalAuthGuard)
  async getPostComments(
    @Param('id') postId: string,
    @Query() queryParams: CommentsQueryParamsDto,
    @OptionalUserFromRequest() user: UserInRequest | null,
  ): Promise<PaginatedView<ViewCommentDto>> {
    const query = new GetPostCommentsQuery(
      postId,
      queryParams,
      user?.id ?? null,
    );
    return await this.queryBus.execute(query);
  }

  @Post(':postId/comments')
  @UseGuards(JwtAuthGuard)
  async createPostComment(
    @Param('postId') postId: string,
    @Body() dto: HttpCommentDto,
    @ExtractUserFromRequest() user: UserInRequest,
  ): Promise<ViewCommentDto> {
    const command = new CreateCommentCommand(postId, dto.content, user.id);
    const commentId = await this.commandBus.execute(command);
    return this.commentsQueryRepository.findByIdOrThrow(commentId);
  }

  @Put(':postId/like-status')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async changeLikeStatus(
    @Param('postId') postId: string,
    @Body() dto: HttpLikeStatusDto,
    @ExtractUserFromRequest() user: UserInRequest,
  ): Promise<void> {
    const command = new LikePostCommand(user.id, postId, dto.likeStatus);
    await this.commandBus.execute(command);
  }

  @Get()
  @UseGuards(JwtOptionalAuthGuard)
  async getPosts(
    @Query() queryParams: PostsQueryParamsDto,
    @OptionalUserFromRequest() user: UserInRequest | null,
  ): Promise<PaginatedView<ViewPostDto>> {
    const query = new GetPostsQuery(queryParams, user?.id ?? null);
    return this.queryBus.execute(query);
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  async createPost(
    @Body() inputCreatePostDto: HttpCreatePostDto,
  ): Promise<ViewPostDto> {
    const postId = await this.postsService.createPost(inputCreatePostDto);
    return this.postsQueryRepository.findById(postId);
  }

  @Put(':postId')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param('postId') postId: string,
    @Body() dto: HttpUpdatePostDto,
  ): Promise<void> {
    await this.postsService.updatePost(postId, dto);
  }

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id') id: string): Promise<void> {
    await this.postsService.deletePost(id);
  }
}
