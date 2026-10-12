import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionsRepository } from '../../infrastructure/questions.repository';
import { DomainUpdateQuestionDto } from '../../domain/dto/DomainUpdateQuestion.dto';

export class UpdateQuestionCommand extends Command<void> {
  constructor(
    public id: string,
    public body: string,
    public correctAnswers: string[],
  ) {
    super();
  }
}

@CommandHandler(UpdateQuestionCommand)
export class UpdateQuestionUseCase implements ICommandHandler<
  UpdateQuestionCommand,
  void
> {
  constructor(private readonly questionsRepository: QuestionsRepository) {}

  async execute(command: UpdateQuestionCommand): Promise<void> {
    const question = await this.questionsRepository.findByIdOrThrow(command.id);
    question.update(
      new DomainUpdateQuestionDto(command.body, command.correctAnswers),
    );
    await this.questionsRepository.save(question);
  }
}
