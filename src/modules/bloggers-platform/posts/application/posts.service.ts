import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from '../domain/Post.entity';
import type { TPostModel } from '../domain/Post.entity';
import { PostsRepository } from '../infrastructure/Post.repository';
import { BlogsRepository } from '../../blogs/infrastructure/blogs.repository';
import { InputCreatePostDto } from '../dto/Post.input-create-dto';
import { InputUpdatePostDto } from '../dto/Post.input-update-dto';
import { UpdatePostDto } from '../dto/Post.update-dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name)
    private PostModel: TPostModel,
    private postsRepository: PostsRepository,
    private blogsRepository: BlogsRepository,
  ) {}

  async createPost(inputCreatePostDto: InputCreatePostDto): Promise<string> {
    const blogDocument = await this.blogsRepository.findById(
      inputCreatePostDto.blogId,
    );

    if (!blogDocument) {
      throw new NotFoundException(
        `Blog with id ${inputCreatePostDto.blogId} not found`,
      );
    }

    const newPostDocument = this.PostModel.makeInstance(
      inputCreatePostDto.title,
      inputCreatePostDto.content,
      inputCreatePostDto.shortDescription,
      inputCreatePostDto.blogId,
      blogDocument.name,
    );

    await this.postsRepository.save(newPostDocument);

    return newPostDocument.id;
  }

  async updatePost(
    postId: string,
    inputUpdatePostDto: InputUpdatePostDto,
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

    const updatePostDto = new UpdatePostDto(
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
