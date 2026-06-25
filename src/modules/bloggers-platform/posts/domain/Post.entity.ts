import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { LikeStatus } from '../../dto/HttpLikeStatus.dto';
import { BaseDbEntity } from '../../../../core/BaseDbEntity';
import { Blog } from '../../blogs/domain/blog.entity';
import { DomainCreatePostDto } from './dto/DomainCreatePost.dto';
import { DomainUpdatePostDto } from './dto/DomainUpdatePost.dto';

export const DB_POST_CONSTRAINTS = {
  TITLE_MAX_LENGTH: 30,
  SHORT_DESCRIPTION_MAX_LENGTH: 100,
  CONTENT_MAX_LENGTH: 1000,
};

export type TPostModel = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  createdAt: Date;
};

export type TPostReactionModel = {
  postId: string;
  userId: string;
  status: LikeStatus;
  addedAt: Date;
};

export type TExtendedPost = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;
  createdAt: Date;
};

export type TExtendedPostWithLikes = TExtendedPost & {
  newestLikes: TViewNewestLike[];
};

export type TPostUserReactionModel = {
  userId: string;
  commentId: string;
  status: LikeStatus;
  addedAt: Date;
};

export type TNewestLike = {
  postId: string;
  userId: string;
  login: string;
  addedAt: Date;
};

export type TViewNewestLike = {
  userId: string;
  login: string;
  addedAt: string;
};

export type TExtendedLikesInfo = {
  likesCount: number;
  dislikesCount: number;
  newestLikes: TViewNewestLike[];
};

@Entity('posts')
export class Post extends BaseDbEntity {
  @Column({ type: 'varchar', nullable: false })
  title!: string;

  @Column({ type: 'varchar', nullable: false })
  shortDescription!: string;

  @Column({ type: 'text', nullable: false })
  content!: string;

  @ManyToOne(() => Blog, (blog) => blog.posts, { nullable: false })
  blog!: Blog;

  @JoinColumn()
  blogId!: string;

  update(dto: DomainUpdatePostDto): void {
    this.title = dto.title;
    this.shortDescription = dto.shortDescription;
    this.content = dto.content;
  }

  static create(dto: DomainCreatePostDto) {
    const post = new this();
    post.title = dto.title;
    post.content = dto.content;
    post.shortDescription = dto.shortDescription;
    post.blog = dto.blog;
    return post;
  }
}
