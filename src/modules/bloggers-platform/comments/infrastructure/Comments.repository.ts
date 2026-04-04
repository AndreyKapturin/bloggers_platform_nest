import { InjectModel } from '@nestjs/mongoose';
import { Comment, type TCommentModel } from '../domain/comment.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name)
    private CommentModel: TCommentModel,
  ) {}
}
