import { Injectable, NotFoundException } from '@nestjs/common';
import { PostsRepository } from '../infrastructure/Post.repository';

@Injectable()
export class PostsService {
  constructor(private postsRepository: PostsRepository) {}

  async deletePost(id: string): Promise<void> {
    const postDocument = await this.postsRepository.findById(id);

    if (!postDocument) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }

    await this.postsRepository.delete(postDocument);
  }
}
