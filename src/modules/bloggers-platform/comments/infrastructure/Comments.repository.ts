import { Comment } from '../domain/comment.entity';
import { Injectable } from '@nestjs/common';
import {
  DomainException,
  DomainExceptionStatus,
} from '../../../../core/exceptions/DomainException';
import {  InjectRepository } from '@nestjs/typeorm';
import {  Repository } from 'typeorm';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectRepository(Comment)
    private readonly commentEntityRepo: Repository<Comment>,
  ) {}

  async findById(id: string): Promise<Comment | null> {
    return this.commentEntityRepo.findOneBy({ id });
  }

  async findByIdOrThrow(id: string): Promise<Comment> {
    const comment = await this.findById(id);

    if (!comment) {
      throw new DomainException(
        DomainExceptionStatus.NotFound,
        `Comment with id ${id} not found`,
        [{ field: 'commentId', message: `Comment with id ${id} not found` }],
      );
    }

    return comment;
  }

  async save(comment: Comment): Promise<void> {
    await this.commentEntityRepo.save(comment);
  }

  async delete(comment: Comment): Promise<void> {
    await this.commentEntityRepo.remove(comment);
  }
}
