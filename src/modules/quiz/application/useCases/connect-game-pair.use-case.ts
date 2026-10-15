import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GamesRepository } from '../../infrastructure/games.repository';
import { Game } from '../../domain/game.entity';
import { Player } from '../../domain/player.entity';
import { PlayersRepository } from '../../infrastructure/players.repository';
import { QuestionsRepository } from '../../infrastructure/questions.repository';
import { GameQuestion } from '../../domain/gameQuestion.entity';
import { GameQuestionsRepository } from '../../infrastructure/gameQuestions.repository';
import {
  DomainException,
  DomainExceptionStatus,
} from '../../../../core/exceptions/DomainException';

export const QUIZ_QUESTIONS_COUNT = 5;

export class ConnectGamePairCommand extends Command<string> {
  constructor(public userId: string) {
    super();
  }
}

@CommandHandler(ConnectGamePairCommand)
export class ConnectGamePairUseCase implements ICommandHandler<
  ConnectGamePairCommand,
  string
> {
  constructor(
    private readonly gamesRepository: GamesRepository,
    private readonly playersRepository: PlayersRepository,
    private readonly questionsRepository: QuestionsRepository,
    private readonly gameQuestionsRepository: GameQuestionsRepository,
  ) {}

  async execute(command: ConnectGamePairCommand): Promise<string> {
    const { userId } = command;

    const activeGame = await this.gamesRepository.findActiveByUserId(userId);

    if (activeGame) {
      throw new DomainException(
        DomainExceptionStatus.PermissionError,
        'User is already participating in active pair',
        [
          {
            field: null,
            message: 'User is already participating in active pair',
          },
        ],
      );
    }

    const pendingGame = await this.gamesRepository.findPendingGame();
    let game: Game;

    if (!pendingGame) {
      game = Game.create();
      await this.gamesRepository.save(game);
      const player = Player.create({
        userId: userId,
        gameId: game.id,
      });
      await this.playersRepository.save(player);
    } else {
      game = pendingGame;
      const player = Player.create({
        userId: userId,
        gameId: game.id,
      });
      await this.playersRepository.save(player);
      game.start();
      await this.gamesRepository.save(game);
      const randomQuestions =
        await this.questionsRepository.getRandomQuestions(QUIZ_QUESTIONS_COUNT);

      if (randomQuestions.length < QUIZ_QUESTIONS_COUNT) {
        throw new DomainException(
          DomainExceptionStatus.Conflict,
          'Not enough available questions for game',
          [
            {
              field: null,
              message: 'Not enough available questions for game',
            },
          ],
        );
      }

      const gameQuestions = randomQuestions.map((rq) =>
        GameQuestion.create({ gameId: game.id, questionId: rq.id }),
      );
      await this.gameQuestionsRepository.saveMany(gameQuestions);
    }

    return game.id;
  }
}
