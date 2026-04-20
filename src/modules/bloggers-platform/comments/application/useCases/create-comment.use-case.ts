import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, type TCommentModel } from '../../domain/comment.entity';
import { CommentsRepository } from '../../infrastructure/Comments.repository';
import { UsersRepository } from '../../../../user-accounts/users/infrastructure/users.repository';
import { PostsRepository } from '../../../posts/infrastructure/Post.repository';
import { DomainCreateCommentDto } from '../../domain/dto/DomainCreateComment.dto';

export class CreateCommentCommand extends Command<string> {
  constructor(
    public postId: string,
    public content: string,
    public userId: string,
  ) {
    super();
  }
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase implements ICommandHandler<
  CreateCommentCommand,
  string
> {
  constructor(
    @InjectModel(Comment.name)
    private CommentModel: TCommentModel,
    private commentsRepository: CommentsRepository,
    private usersRepository: UsersRepository,
    private postsRepository: PostsRepository,
  ) {}

  async execute(command: CreateCommentCommand): Promise<string> {
    const { userId, postId, content } = command;
    const userDocument = await this.usersRepository.findByIdOrThrow(userId);
    const postDocument = await this.postsRepository.findByIdOrThrow(postId);

    const createCommentDto = new DomainCreateCommentDto(
      postId,
      content,
      userDocument.login,
      userId,
    );

    const commentDocument = this.CommentModel.makeInstanse(createCommentDto);

    await this.commentsRepository.save(commentDocument);

    return commentDocument.id;
  }
}
