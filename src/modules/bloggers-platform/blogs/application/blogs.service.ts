import { Injectable, NotFoundException } from '@nestjs/common';
import { InputCreateBlogDto } from '../dto/Blog.input-create-dto';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { Blog } from '../domain/blog.entity';
import type { TBlogModel } from '../domain/blog.entity';
import { InjectModel } from '@nestjs/mongoose';
import { InputUpdateBlogDto } from '../dto/Blog.input-update-dto';

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: TBlogModel,
    private blogsRepository: BlogsRepository,
  ) {}

  async createBlog(inputCreateBlogDto: InputCreateBlogDto): Promise<string> {
    const createdBlogDocument = this.BlogModel.makeInstanse(inputCreateBlogDto);
    await this.blogsRepository.save(createdBlogDocument);
    return createdBlogDocument.id;
  }

  async updateBlog(
    id: string,
    inputUpdateBlogDto: InputUpdateBlogDto,
  ): Promise<void> {
    const blogDocument = await this.blogsRepository.findById(id);

    if (!blogDocument) throw new NotFoundException(`Blog with id ${id} not found`);

    blogDocument.update(inputUpdateBlogDto);
    await this.blogsRepository.save(blogDocument);
  }

  async deleteBlog(id: string): Promise<void> {
    const blogDocument = await this.blogsRepository.findById(id);

    if (!blogDocument) throw new NotFoundException(`Blog with id ${id} not found`);

    await this.blogsRepository.delete(blogDocument);
  }
}
