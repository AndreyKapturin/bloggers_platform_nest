import { LikeStatus } from '../../../dto/HttpLikeStatus.dto';
import {
  TExtendedPostWithLikes,
  TViewNewestLike,
} from '../../domain/Post.entity';

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
    newestLikes: TViewNewestLike[];
  };

  static toView(post: TExtendedPostWithLikes): ViewPostDto {
    return {
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt.toISOString(),
      extendedLikesInfo: {
        likesCount: post.likesCount,
        dislikesCount: post.dislikesCount,
        myStatus: post.myStatus,
        newestLikes: post.newestLikes,
      },
    };
  }
}
