import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { User } from '../../../user-accounts/users/domain/user.entity';
import { Comment } from './comment.entity';
import { LikeStatus } from '../../dto/HttpLikeStatus.dto';
import { DomainCreateCommentReactionDto } from './dto/DomainCreateCommentReaction.dto';

@Entity({ name: 'commentReactions' })
export class CommentReaction {
  @ManyToOne(() => User, { nullable: false })
  user!: User;

  @PrimaryColumn({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => Comment, { nullable: false })
  comment!: Comment;

  @PrimaryColumn({ type: 'uuid' })
  commentId!: string;

  @Column({ type: 'enum', enum: LikeStatus })
  status!: LikeStatus;

  @CreateDateColumn({ name: 'createdAt ' })
  createdAt!: Date;

  updateStatus(status: LikeStatus) {
    this.status = status;
  }

  static create(dto: DomainCreateCommentReactionDto) {
    const commentReaction = new this();
    commentReaction.status = dto.status;
    commentReaction.comment = dto.comment;
    commentReaction.user = dto.user;
    return commentReaction;
  }
}
