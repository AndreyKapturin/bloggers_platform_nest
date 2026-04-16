import { InjectModel } from '@nestjs/mongoose';
import { Comment, type TCommentModel } from '../domain/comment.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ViewCommentDto } from '../api/dto/ViewComment.dto';
import { CommentsQueryParamsDto } from '../api/dto/CommentsQueryParams.dto';
import { PaginatedView } from '../../../../core/dto/PaginatedView.dto';
import { QueryFilter } from 'mongoose';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name)
    private CommentModel: TCommentModel,
  ) {}

  async findById(id: string): Promise<ViewCommentDto> {
    const commentDocument = await this.CommentModel.findById(id);
    if (!commentDocument) {
      throw new NotFoundException(`Comment with id ${id} not found`);
    }
    return ViewCommentDto.toView(commentDocument);
  }

  async findForPost(
    postId: string,
    query: CommentsQueryParamsDto,
  ): Promise<PaginatedView<ViewCommentDto>> {
    const { pageNumber, pageSize, skip, sortBy, sortDirection } = query;

    const filter: QueryFilter<Comment> = { postId };

    const commentDocuments = await this.CommentModel.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize);

    const totalCount = await this.CommentModel.countDocuments(filter);
    const viewComments = commentDocuments.map((commentDocument) =>
      ViewCommentDto.toView(commentDocument),
    );
    const paginatedViewComments = PaginatedView.toView(
      pageNumber,
      pageSize,
      totalCount,
      viewComments,
    );
    return paginatedViewComments;
  }
}
