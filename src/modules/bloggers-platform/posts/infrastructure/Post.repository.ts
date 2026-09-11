import { Injectable } from '@nestjs/common';
import {
  DomainException,
  DomainExceptionStatus,
} from '../../../../core/exceptions/DomainException';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../domain/Post.entity';
import { PostReaction } from '../domain/PostReaction.entity';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectRepository(Post)
    private readonly postsEntityRepository: Repository<Post>,
    @InjectRepository(PostReaction)
    private readonly postReactionsEntityRepository: Repository<PostReaction>,
  ) {}

  async findUserReaction(
    postId: string,
    userId: string,
  ): Promise<PostReaction | null> {
    return this.postReactionsEntityRepository.findOneBy({ postId, userId });
  }

  async findById(id: string): Promise<Post | null> {
    return this.postsEntityRepository.findOneBy({ id });
  }

  async findByIdOrThrow(id: string): Promise<Post> {
    const post = await this.findById(id);

    if (!post) {
      throw new DomainException(
        DomainExceptionStatus.NotFound,
        `Post with id ${id} not found`,
        [{ field: 'postId', message: `Post with id ${id} not found` }],
      );
    }

    return post;
  }

  async save(post: Post): Promise<void> {
    await this.postsEntityRepository.save(post);
  }

  async delete(post: Post): Promise<void> {
    await this.postsEntityRepository.remove(post);
  }
}
