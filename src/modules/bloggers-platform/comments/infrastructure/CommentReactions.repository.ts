import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CommentReaction } from "../domain/CommentReaction.entity";

@Injectable()
export class CommentReactionsRepository {
  constructor(
    @InjectRepository(CommentReaction)
    private readonly commentReactionEntityRepo: Repository<CommentReaction>
  ) {}

  async findUserReaction(commentId: string, userId: string): Promise<CommentReaction | null> {
    return this.commentReactionEntityRepo.findOneBy({ commentId, userId });
  }

  async save(commentReaction: CommentReaction): Promise<void> {
    await this.commentReactionEntityRepo.save(commentReaction);
  }
}