import { Injectable, NotFoundException } from '@nestjs/common';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { HttpUpdateBlogDto } from '../api/dto/HttpUpdateBlog.dto';

@Injectable()
export class BlogsService {
  constructor(private blogsRepository: BlogsRepository) {}

  async updateBlog(
    id: string,
    inputUpdateBlogDto: HttpUpdateBlogDto,
  ): Promise<void> {
    const blogDocument = await this.blogsRepository.findById(id);

    if (!blogDocument)
      throw new NotFoundException(`Blog with id ${id} not found`);

    blogDocument.update(inputUpdateBlogDto);
    await this.blogsRepository.save(blogDocument);
  }

  async deleteBlog(id: string): Promise<void> {
    const blogDocument = await this.blogsRepository.findById(id);

    if (!blogDocument)
      throw new NotFoundException(`Blog with id ${id} not found`);

    await this.blogsRepository.delete(blogDocument);
  }
}
