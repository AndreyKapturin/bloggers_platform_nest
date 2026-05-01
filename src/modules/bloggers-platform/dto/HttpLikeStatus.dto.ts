import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum LikeStatus {
  Like = 'Like',
  Dislike = 'Dislike',
  None = 'None',
}

export class HttpLikeStatusDto {
  @IsEnum(LikeStatus)
  @IsString()
  @IsNotEmpty()
  likeStatus!: LikeStatus;
}
