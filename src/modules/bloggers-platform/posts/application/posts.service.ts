import { Injectable, NotFoundException } from '@nestjs/common';
import { PostsRepository } from '../infrastructure/Post.repository';
import { BlogsRepository } from '../../blogs/infrastructure/blogs.repository';
import { DomainUpdatePostDto } from '../domain/dto/DomainUpdatePost.dto';
import { HttpUpdatePostDto } from '../api/dto/HttpUpdatePost.dto';

@Injectable()
export class PostsService {
  constructor(
    private postsRepository: PostsRepository,
    private blogsRepository: BlogsRepository,
  ) {}

  async updatePost(
    postId: string,
    inputUpdatePostDto: HttpUpdatePostDto,
  ): Promise<void> {
    const postDocument = await this.postsRepository.findById(postId);

    if (!postDocument) {
      throw new NotFoundException(`Post with id ${postId} not found`);
    }

    const blogDocument = await this.blogsRepository.findById(
      inputUpdatePostDto.blogId,
    );

    if (!blogDocument) {
      throw new NotFoundException(
        `Blog with id ${inputUpdatePostDto.blogId} not found`,
      );
    }

    const updatePostDto = new DomainUpdatePostDto(
      inputUpdatePostDto.title,
      inputUpdatePostDto.shortDescription,
      inputUpdatePostDto.content,
      inputUpdatePostDto.blogId,
      blogDocument.name,
    );

    postDocument.update(updatePostDto);

    await this.postsRepository.save(postDocument);
  }

  async deletePost(id: string): Promise<void> {
    const postDocument = await this.postsRepository.findById(id);

    if (!postDocument) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }

    await this.postsRepository.delete(postDocument);
  }
}
