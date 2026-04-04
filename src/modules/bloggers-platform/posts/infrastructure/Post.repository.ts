import { Injectable } from '@nestjs/common';
import {
  Post,
  type TPostDocument,
  type TPostModel,
} from '../domain/Post.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(Post.name)
    private PostModel: TPostModel,
  ) {}

  async findById(id: string): Promise<TPostDocument | null> {
    return this.PostModel.findById(id);
  }

  async save(postDocument: TPostDocument): Promise<void> {
    await postDocument.save();
  }

  async delete(postDocument: TPostDocument): Promise<boolean> {
    const deleteResult = await postDocument.deleteOne();
    return deleteResult.deletedCount === 1;
  }
}
