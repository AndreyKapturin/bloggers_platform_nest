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
import { CommandBus } from '@nestjs/cqrs';
import { CreateCommentCommand } from '../../comments/application/useCases/create-comment.use-case';
import { HttpCreateCommentDto } from '../../comments/api/dto/HttpCreateComment.dto';
import { ExtractUserFromRequest } from '../../../user-accounts/auth/decorators/extract-userId.decorator';
import { UserInRequest } from '../../../user-accounts/auth/dto/UserInRequest.dto';

@Controller('posts')
export class PostsController {
  constructor(
    private postsService: PostsService,
    private postsQueryRepository: PostsQueryRepository,
    private commentsQueryRepository: CommentsQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Get(':id')
  async getById(@Param('id') id: string): Promise<ViewPostDto> {
    return this.postsQueryRepository.findById(id);
  }

  @Get(':id/comments')
  async getPostComments(
    @Param('id') postId: string,
    @Query() query: CommentsQueryParamsDto,
  ): Promise<PaginatedView<ViewCommentDto>> {
    await this.commentsQueryRepository.findById(postId);
    return this.commentsQueryRepository.findForPost(postId, query);
  }

  @Post(':postId/comments')
  @UseGuards(JwtAuthGuard)
  async createPostComment(
    @Param('postId') postId: string,
    @Body() dto: HttpCreateCommentDto,
    @ExtractUserFromRequest() user: UserInRequest,
  ): Promise<ViewCommentDto> {
    const command = new CreateCommentCommand(postId, dto.content, user.id);
    const commentId = await this.commandBus.execute(command);
    return this.commentsQueryRepository.findById(commentId);
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
