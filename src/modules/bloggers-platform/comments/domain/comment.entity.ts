import { Column, Entity, ManyToOne } from 'typeorm';
import { LikeStatus } from '../../dto/HttpLikeStatus.dto';
import { BaseDbEntity } from '../../../../core/BaseDbEntity';
import { Post } from '../../posts/domain/Post.entity';
import { User } from '../../../user-accounts/users/domain/user.entity';
import { DomainCreateCommentDto } from './dto/DomainCreateComment.dto';

export const COMMENT_CONTENT_CONSTRAINTS = {
  MIN_LENGTH: 20,
  MAX_LENGTH: 300,
};

@Entity({ name: 'comments'})
export class Comment extends BaseDbEntity {
  @Column({ type: 'text', nullable: false })
  content!: string;

  @ManyToOne(() => Post, { nullable: false })
  post!: Post;

  @Column({ type: 'uuid', nullable: false })
  postId!: string;
  
  @ManyToOne(() => User, { nullable: false })
  user!: User;

  @Column({ type: 'uuid', nullable: false })
  userId!: string;

  static create(dto: DomainCreateCommentDto) {
    const comment = new this();
    comment.content = dto.content;
    comment.post = dto.post;
    comment.user = dto.user;
    return comment;
  }
}

export type TExtendedCommentModel = {
  id: string;
  content: string;
  postId: string;
  userId: string;
  userLogin: string;
  createdAt: Date;
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;
};

export type TCommentUserReactionModel = {
  userId: string;
  commentId: string;
  status: LikeStatus;
  createdAt: Date;
};
