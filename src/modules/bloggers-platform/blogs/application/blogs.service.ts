import { Injectable, NotFoundException } from '@nestjs/common';
import { BlogsRepository } from '../infrastructure/blogs.repository';

@Injectable()
export class BlogsService {
  constructor(private blogsRepository: BlogsRepository) {}

  async deleteBlog(id: string): Promise<void> {
    const blogDocument = await this.blogsRepository.findById(id);

    if (!blogDocument)
      throw new NotFoundException(`Blog with id ${id} not found`);

    await this.blogsRepository.delete(blogDocument);
  }
}
