import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '../domain/question.entity';
import {
  DomainException,
  DomainExceptionStatus,
} from '../../../core/exceptions/DomainException';
import { Game, GameStatus } from '../domain/game.entity';
import { Player } from '../domain/player.entity';

@Injectable()
export class GamesRepository {
  constructor(
    @InjectRepository(Game)
    private readonly gamesEntityRepository: Repository<Game>,
  ) {}

  async findPendingGame(): Promise<Game | null> {
    return this.gamesEntityRepository.findOne({
      where: { status: GameStatus.PendingSecondPlayer },
    });
  }

  async findActiveByUserId(userId: string): Promise<Game | null> {
    return this.gamesEntityRepository
      .createQueryBuilder('g')
      .innerJoin(Player, 'p', 'p.gameId = g.id')
      .where('p.userId = :userId', { userId })
      .andWhere('g.status = :status', { status: GameStatus.Active })
      .getOne();
  }

  // async findById(id: string): Promise<Question | null> {
  //   return this.gamesEntityRepository.findOne({ where: { id } });
  // }

  // async findByIdOrThrow(id: string): Promise<Question> {
  //   const question = await this.findById(id);

  //   if (!question) {
  //     throw new DomainException(
  //       DomainExceptionStatus.NotFound,
  //       `Question with id ${id} not found`,
  //       [
  //         {
  //           field: 'questionId',
  //           message: `Question with id ${id} not found`,
  //         },
  //       ],
  //     );
  //   }

  //   return question;
  // }

  // async delete(question: Question): Promise<void> {
  //   await this.questionEntityRepository.remove(question);
  // }

  async save(game: Game): Promise<void> {
    await this.gamesEntityRepository.save(game);
  }
}
