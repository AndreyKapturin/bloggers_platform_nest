import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikeStatus } from '../../../dto/HttpLikeStatus.dto';
import { PostsRepository } from '../../infrastructure/Post.repository';
import { PostReactionRepository } from '../../infrastructure/PostReaction.repository';
import { PostReaction } from '../../domain/PostReaction.entity';

export class LikePostCommand {
  constructor(
    public userId: string,
    public postId: string,
    public status: LikeStatus,
  ) {}
}

@CommandHandler(LikePostCommand)
export class LikePostUseCase implements ICommandHandler<LikePostCommand> {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly postReactionRepository: PostReactionRepository,
  ) {}

  async execute(command: LikePostCommand): Promise<void> {
    const { postId, userId, status: newLikeStatus } = command;

    await this.postsRepository.findByIdOrThrow(postId);

    let reaction = await this.postReactionRepository.findUserReaction(
      postId,
      userId,
    );

    if (reaction) {
      if (reaction.status === newLikeStatus) return;
      reaction.changeStatus(newLikeStatus);
    } else {
      if (newLikeStatus === LikeStatus.None) return;
      reaction = PostReaction.create({
        status: newLikeStatus,
        postId,
        userId,
      });
    }
    await this.postReactionRepository.save(reaction);
  }
}
