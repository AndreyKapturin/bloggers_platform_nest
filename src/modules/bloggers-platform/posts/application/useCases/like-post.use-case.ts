import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikeStatus } from '../../../dto/HttpLikeStatus.dto';
import { PostsRepository } from '../../infrastructure/Post.repository';

export class LikePostCommand {
  constructor(
    public userId: string,
    public postId: string,
    public status: LikeStatus,
  ) {}
}

@CommandHandler(LikePostCommand)
export class LikePostUseCase implements ICommandHandler<LikePostCommand> {
  constructor(private postsRepository: PostsRepository) {}

  async execute(command: LikePostCommand): Promise<void> {
    const { postId, userId, status: newLikeStatus } = command;

    await this.postsRepository.findByIdOrThrow(postId);

    const oldReaction = await this.postsRepository.findUserReaction(
      postId,
      userId,
    );

    if (oldReaction) {
      if (oldReaction.status === newLikeStatus) return;
      this.postsRepository.changeReactionStatus(postId, userId, newLikeStatus);
    } else {
      if (newLikeStatus === LikeStatus.None) return;
      this.postsRepository.createReaction(postId, userId, newLikeStatus);
    }
  }
}
