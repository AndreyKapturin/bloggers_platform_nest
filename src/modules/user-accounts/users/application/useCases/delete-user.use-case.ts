import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.repository';

export class DeleteUserCommand extends Command<void> {
  constructor(public userId: string) {
    super();
  }
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<
  DeleteUserCommand,
  void
> {
  constructor(private usersRepository: UsersRepository) {}

  async execute(command: DeleteUserCommand): Promise<void> {
    const userDocument = await this.usersRepository.findByIdOrThrow(
      command.userId,
    );
    await this.usersRepository.delete(userDocument);
  }
}
