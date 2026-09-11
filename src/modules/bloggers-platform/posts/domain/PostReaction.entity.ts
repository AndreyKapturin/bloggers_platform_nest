import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { LikeStatus } from '../../dto/HttpLikeStatus.dto';
import { Post } from './Post.entity';
import { User } from '../../../user-accounts/users/domain/user.entity';
import { DomainCreatePostReaction } from './dto/DomainCreatePostReaction.dto';

@Entity('postReactions')
export class PostReaction {
  @ManyToOne(() => Post, (post) => post.reactions, { nullable: false, onDelete: 'CASCADE' })
  post!: Post;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  user!: User;

  @PrimaryColumn({ nullable: false })
  postId!: string;

  @PrimaryColumn({ nullable: false })
  userId!: string;

  @Column({ type: 'enum', enum: LikeStatus })
  status!: LikeStatus;

  @CreateDateColumn()
  addedAt!: Date;

  changeStatus(newStatus: LikeStatus) {
    this.status = newStatus;
  }

  static create(dto: DomainCreatePostReaction) {
    const postReaction = new this();
    postReaction.status = dto.status;
    postReaction.postId = dto.postId;
    postReaction.post = { id: dto.postId } as Post;
    postReaction.userId = dto.userId;
    postReaction.user = { id: dto.userId } as User;
    postReaction.addedAt = new Date();
    return postReaction;
  }
}
