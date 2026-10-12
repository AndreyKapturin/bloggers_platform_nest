import { Module } from '@nestjs/common';
import { SA_QuizQuestionsController } from './api/QuizQuestions.sa-controller';
import { Question } from './domain/question.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionsRepository } from './infrastructure/questions.repository';
import { QuestionsQueryRepository } from './infrastructure/questions.query-repository';
import { GetQuestionQueryHandler } from './application/queries/get-question.query';
import { CreateQuestionUseCase } from './application/useCases/create-question.use-case';
import { GetQuestionsQueryHandler } from './application/queries/get-questions.query';
import { DeleteQuestionUseCase } from './application/useCases/delete-question.use-case';
import { UpdateQuestionUseCase } from './application/useCases/update-question.use-case';
import { PublishQuestionUseCase } from './application/useCases/publish-question.use-case';

const useCases = [
  CreateQuestionUseCase,
  PublishQuestionUseCase,
  UpdateQuestionUseCase,
  DeleteQuestionUseCase,
];

const queries = [
  GetQuestionQueryHandler,
  GetQuestionsQueryHandler
];

@Module({
  imports: [TypeOrmModule.forFeature([Question])],
  controllers: [SA_QuizQuestionsController],
  providers: [
    QuestionsRepository,
    QuestionsQueryRepository,
    ...useCases,
    ...queries,
  ],
})
export class QuizModule {}
