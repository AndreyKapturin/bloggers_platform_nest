import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { plainToClass } from 'class-transformer';
import { Question } from '../../domain/question.entity';
import { DomainCreateQuestionDto } from '../../domain/dto/DomainCreateQuestion.dto';
import { QuestionsRepository } from '../../infrastructure/questions.repository';

export class CreateQuestionCommand extends Command<string> {
  constructor(
    public body: string,
    public correctAnswers: string[],
  ) {
    super();
  }
}

@CommandHandler(CreateQuestionCommand)
export class CreateQuestionUseCase implements ICommandHandler<
  CreateQuestionCommand,
  string
> {
  constructor(
    private readonly questionsRepository: QuestionsRepository,
  ) {}

  async execute(command: CreateQuestionCommand): Promise<string> {
    const createQuestionDto = plainToClass(DomainCreateQuestionDto, command);
    const question = Question.create(createQuestionDto);
    await this.questionsRepository.save(question);
    return question.id;
  }
}
