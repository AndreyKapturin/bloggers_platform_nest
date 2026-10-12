import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionsRepository } from '../../infrastructure/questions.repository';

export class PublishQuestionCommand extends Command<void> {
  constructor(public id: string) {
    super();
  }
}

@CommandHandler(PublishQuestionCommand)
export class PublishQuestionUseCase implements ICommandHandler<
  PublishQuestionCommand,
  void
> {
  constructor(private readonly questionsRepository: QuestionsRepository) {}

  async execute(command: PublishQuestionCommand): Promise<void> {
    const question = await this.questionsRepository.findByIdOrThrow(command.id);
    question.publish();
    await this.questionsRepository.save(question);
  }
}
