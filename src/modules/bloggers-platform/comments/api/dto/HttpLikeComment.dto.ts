import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum LikeStatus {
  Like = 'Like',
  Dislike = 'Dislike',
  None = 'None',
}

export class HttpLikeCommentDto {
  @IsEnum(LikeStatus)
  @IsString()
  @IsNotEmpty()
  likeStatus!: LikeStatus;
}
