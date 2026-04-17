import { InjectModel } from '@nestjs/mongoose';
import {
  Comment,
  TCommentDocument,
  type TCommentModel,
} from '../domain/comment.entity';
import { Injectable } from '@nestjs/common';
import {
  DomainException,
  DomainExceptionStatus,
} from '../../../../core/exceptions/DomainException';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name)
    private CommentModel: TCommentModel,
  ) {}

  async findById(id: string): Promise<TCommentDocument | null> {
    return this.CommentModel.findById(id);
  }

  async findByIdOrThrow(id: string): Promise<TCommentDocument> {
    const commentDocument = await this.findById(id);

    if (!commentDocument) {
      throw new DomainException(
        DomainExceptionStatus.NotFound,
        `Comment with id ${id} not found`,
        [{ field: 'commentId', message: `Comment with id ${id} not found` }],
      );
    }

    return commentDocument;
  }

  async save(commentDocument: TCommentDocument): Promise<void> {
    await commentDocument.save();
  }
}
