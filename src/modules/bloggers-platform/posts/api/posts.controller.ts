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
import { InputCreatePostDto } from '../dto/Post.input-create-dto';
import { ViewPostDto } from '../dto/Post.view-dto';
import { PostsService } from '../application/posts.service';
import { PostsQueryRepository } from '../infrastructure/Post.query-repository';
import { PostsQueryParamsDto } from '../dto/PostQueryParams.dto';
import { PaginatedView } from 'src/core/dto/PaginatedView.dto';
import { InputUpdatePostDto } from '../dto/Post.input-update-dto';

@Controller('posts')
export class PostsController {
  constructor(
    private postsService: PostsService,
    private postsQueryRepository: PostsQueryRepository,
  ) {}

  @Get(':id')
  getById(@Param('id') id: string): Promise<ViewPostDto> {
    return this.postsQueryRepository.findById(id);
  }

  @Get()
  getPosts(
    @Query() query: PostsQueryParamsDto,
  ): Promise<PaginatedView<ViewPostDto>> {
    return this.postsQueryRepository.find(query);
  }

  @Post()
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
