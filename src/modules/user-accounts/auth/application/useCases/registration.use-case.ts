import {
  Command,
  CommandBus,
  CommandHandler,
  ICommandHandler,
} from '@nestjs/cqrs';
import { CreateUserCommand } from '../../../users/application/useCases/create-user.use-case';
import { SendConfirmationCodeCommand } from './send-confirmation-code.use-case';

export class RegistrationCommand extends Command<void> {
  constructor(
    public login: string,
    public email: string,
    public password: string,
  ) {
    super();
  }
}

@CommandHandler(RegistrationCommand)
export class RegistrationUseCase implements ICommandHandler<
  RegistrationCommand,
  void
> {
  constructor(private commandBus: CommandBus) {}

  async execute(command: RegistrationCommand): Promise<void> {
    const { login, email, password } = command;
    const createUserCommand = new CreateUserCommand(login, email, password);
    await this.commandBus.execute(createUserCommand);
    await this.commandBus.execute(new SendConfirmationCodeCommand(email));
  }
}
