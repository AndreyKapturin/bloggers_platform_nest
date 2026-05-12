import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog } from '../domain/blog.entity';
import type { TBlogDocument, TBlogModel } from '../domain/blog.entity';
import {
  DomainException,
  DomainExceptionStatus,
} from '../../../../core/exceptions/DomainException';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: TBlogModel) {}

  async findById(id: string): Promise<TBlogDocument | null> {
    return this.BlogModel.findById(id);
  }

  async findByIdOrThrow(id: string): Promise<TBlogDocument> {
    const foundBlog = await this.findById(id);

    if (!foundBlog) {
      throw new DomainException(
        DomainExceptionStatus.NotFound,
        `Blog with id ${id} not found`,
        [
          {
            field: 'blogId',
            message: `Blog with id ${id} not found`,
          },
        ],
      );
    }

    return foundBlog;
  }

  async save(blogDocument: TBlogDocument): Promise<void> {
    await blogDocument.save();
  }

  async delete(blogDocument: TBlogDocument): Promise<boolean> {
    const deleteResult = await blogDocument.deleteOne();
    return deleteResult.deletedCount === 1;
  }
}
