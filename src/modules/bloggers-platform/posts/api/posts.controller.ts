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
import { CommentsQueryParamsDto } from '../../comments/dto/CommentsQueryParams.dto';
import { CommentsQueryRepository } from '../../comments/infrastructure/Comments.query-repository';
import { ViewCommentDto } from '../../comments/dto/Comment.view-dto';
import { BasicAuthGuard } from '../../../user-accounts/auth/strategies/basic/Basic.guard';

@Controller('posts')
export class PostsController {
  constructor(
    private postsService: PostsService,
    private postsQueryRepository: PostsQueryRepository,
    private commentsQueryRepository: CommentsQueryRepository,
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
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param('id') id: string,
    @Body() inputUpdatePostDto: InputUpdatePostDto,
  ): Promise<void> {
    await this.postsService.updatePost(id, inputUpdatePostDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id') id: string): Promise<void> {
    await this.postsService.deletePost(id);
  }
}
