import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostReaction } from '../domain/PostReaction.entity';

@Injectable()
export class PostReactionRepository {
  constructor(
    @InjectRepository(PostReaction)
    private readonly postReactionsEntityRepository: Repository<PostReaction>,
  ) {}

  async findUserReaction(
    postId: string,
    userId: string,
  ): Promise<PostReaction | null> {
    return this.postReactionsEntityRepository.findOneBy({ postId, userId });
  }

  async save(postReaction: PostReaction): Promise<void> {
    await this.postReactionsEntityRepository.save(postReaction);
  }

  async delete(postReaction: PostReaction): Promise<void> {
    await this.postReactionsEntityRepository.remove(postReaction);
  }
}
