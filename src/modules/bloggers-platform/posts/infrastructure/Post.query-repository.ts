import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, type TPostModel } from '../domain/Post.entity';
import { ViewPostDto } from '../dto/Post.view-dto';
import { PaginatedView } from 'src/core/dto/PaginatedView.dto';
import { PostsQueryParamsDto } from '../dto/PostQueryParams.dto';
import { QueryFilter } from 'mongoose';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name)
    private PostModel: TPostModel,
  ) {}

  async findById(id: string): Promise<ViewPostDto> {
    const foundPost = await this.PostModel.findById(id);
    if (!foundPost) throw new NotFoundException(`Post with id ${id} not found`);
    return ViewPostDto.toView(foundPost);
  }

  async find(query: PostsQueryParamsDto): Promise<PaginatedView<ViewPostDto>> {
    return this._find({}, query);
  }

  async findForBlog(
    blogId: string,
    query: PostsQueryParamsDto,
  ): Promise<PaginatedView<ViewPostDto>> {
    return this._find({ blogId }, query);
  }

  private async _find(
    filter: QueryFilter<Post>,
    query: PostsQueryParamsDto,
  ): Promise<PaginatedView<ViewPostDto>> {
    const { pageNumber, pageSize, skip, sortBy, sortDirection } = query;

    const postDocuments = await this.PostModel.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize);

    const totalCount = await this.PostModel.countDocuments(filter);

    const viewPosts = postDocuments.map((postDocument) =>
      ViewPostDto.toView(postDocument),
    );
    const paginatedPosts = PaginatedView.toView(
      pageNumber,
      pageSize,
      totalCount,
      viewPosts,
    );
    return paginatedPosts;
  }
}
