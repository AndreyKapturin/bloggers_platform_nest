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
import { InputCreatePostDto } from '../dto/Post.input-create-dto';
import { ViewPostDto } from '../dto/Post.view-dto';
import { PostsService } from '../application/posts.service';
import { PostsQueryRepository } from '../infrastructure/Post.query-repository';
import { PostsQueryParamsDto } from '../dto/PostQueryParams.dto';
import { PaginatedView } from '../../../../core/dto/PaginatedView.dto';
import { InputUpdatePostDto } from '../dto/Post.input-update-dto';
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
  async getById(@Param('id') id: string): Promise<ViewPostDto> {
    return this.postsQueryRepository.findById(id);
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

  @Get()
  async getPosts(
    @Query() query: PostsQueryParamsDto,
  ): Promise<PaginatedView<ViewPostDto>> {
    return this.postsQueryRepository.find(query);
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  async createPost(
    @Body() inputCreatePostDto: InputCreatePostDto,
  ): Promise<ViewPostDto> {
    const postId = await this.postsService.createPost(inputCreatePostDto);
    return this.postsQueryRepository.findById(postId);
  }

  @Put(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param('id') id: string,
    @Body() inputUpdatePostDto: InputUpdatePostDto,
  ): Promise<void> {
    await this.postsService.updatePost(id, inputUpdatePostDto);
  }

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id') id: string): Promise<void> {
    await this.postsService.deletePost(id);
  }
}
