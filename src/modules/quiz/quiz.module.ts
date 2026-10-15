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
import { Game } from './domain/game.entity';
import { Player } from './domain/player.entity';
import { GameQuestion } from './domain/gameQuestion.entity';
import { PlayerAnswer } from './domain/playerAnswer.entity';
import { QuizGamePairsController } from './api/QuizGamePairs.controller';
import { ConnectGamePairUseCase } from './application/useCases/connect-game-pair.use-case';
import { GamesRepository } from './infrastructure/games.repository';
import { GameQuestionsRepository } from './infrastructure/gameQuestions.repository';
import { PlayersRepository } from './infrastructure/players.repository';

const useCases = [
  CreateQuestionUseCase,
  PublishQuestionUseCase,
  UpdateQuestionUseCase,
  DeleteQuestionUseCase,
  ConnectGamePairUseCase
];

const queries = [GetQuestionQueryHandler, GetQuestionsQueryHandler];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Question,
      Game,
      Player,
      GameQuestion,
      PlayerAnswer,
    ]),
  ],
  controllers: [SA_QuizQuestionsController, QuizGamePairsController],
  providers: [
    QuestionsRepository,
    QuestionsQueryRepository,
    GamesRepository,
    GameQuestionsRepository,
    PlayersRepository,
    ...useCases,
    ...queries,
  ],
})
export class QuizModule {}
