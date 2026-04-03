import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog } from '../domain/blog.entity';
import type { TBlogDocument, TBlogModel } from '../domain/blog.entity';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: TBlogModel) {}

  async findById(id: string): Promise<TBlogDocument | null> {
    return this.BlogModel.findById(id);
  }

  async save(blogDocument: TBlogDocument): Promise<void> {
    await blogDocument.save();
  }

  async delete(blogDocument: TBlogDocument): Promise<boolean> {
    const deleteResult = await blogDocument.deleteOne();
    return deleteResult.deletedCount === 1;
  }
}
