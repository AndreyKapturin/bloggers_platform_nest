import { Injectable } from '@nestjs/common';
import {
  Post,
  type TPostDocument,
  type TPostModel,
} from '../domain/Post.entity';
import { InjectModel } from '@nestjs/mongoose';
import {
  DomainException,
  DomainExceptionStatus,
} from '../../../../core/exceptions/DomainException';
import type { TUserDocument } from '../../../user-accounts/users/domain/user.entity';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(Post.name)
    private PostModel: TPostModel,
  ) {}

  async findById(id: string): Promise<TPostDocument | null> {
    return this.PostModel.findById(id);
  }

  async findByIdOrThrow(id: string): Promise<TPostDocument> {
    const postDocument = await this.findById(id);

    if (!postDocument) {
      throw new DomainException(
        DomainExceptionStatus.NotFound,
        `Post with id ${id} not found`,
        [{ field: 'postId', message: `Post with id ${id} not found` }],
      );
    }

    return postDocument;
  }

  async save(postDocument: TPostDocument): Promise<void> {
    await postDocument.save();
  }

  async delete(postDocument: TPostDocument): Promise<boolean> {
    const deleteResult = await postDocument.deleteOne();
    return deleteResult.deletedCount === 1;
  }
}
