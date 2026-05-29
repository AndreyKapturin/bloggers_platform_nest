import { LikeStatus } from '../../../dto/HttpLikeStatus.dto';
import { NewestLike, TPostWithBlogName } from '../../domain/Post.entity';

export class ViewPostDto {
  id!: string;
  title!: string;
  shortDescription!: string;
  content!: string;
  blogId!: string;
  blogName!: string;
  createdAt!: string;
  extendedLikesInfo!: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatus;
    newestLikes: NewestLike[];
  };

  static toView(
    post: TPostWithBlogName,
    myStatus = LikeStatus.None,
  ): ViewPostDto {
    return {
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt.toISOString(),
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus,
        newestLikes: [],
      },
    };
  }
}
