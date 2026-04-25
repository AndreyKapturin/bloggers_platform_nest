import { LikeStatus } from '../../../dto/HttpLikeStatus.dto';
import { NewestLike, TPostDocument } from '../../domain/Post.entity';

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
    postDocument: TPostDocument,
    myStatus = LikeStatus.None,
  ): ViewPostDto {
    return {
      id: postDocument.id,
      title: postDocument.title,
      shortDescription: postDocument.shortDescription,
      content: postDocument.content,
      blogId: postDocument.blogId,
      blogName: postDocument.blogName,
      createdAt: postDocument.createdAt.toISOString(),
      extendedLikesInfo: {
        likesCount: postDocument.extendedLikesInfo.likesCount,
        dislikesCount: postDocument.extendedLikesInfo.dislikesCount,
        myStatus,
        newestLikes: postDocument.extendedLikesInfo.newestLikes,
      },
    };
  }
}
