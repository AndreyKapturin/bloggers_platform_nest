import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Game, GameStatus } from '../domain/game.entity';
import { Player } from '../domain/player.entity';

@Injectable()
export class GamesRepository {
  constructor(
    @InjectRepository(Game)
    private readonly gamesEntityRepository: Repository<Game>,
  ) {}

  async lockMatchmakingQueue(manager: EntityManager): Promise<void> {
    await manager.query('SELECT pg_advisory_xact_lock($1::bigint)', [
      0x5155495a,
    ]);
  }

  async findPendingGame(manager?: EntityManager): Promise<Game | null> {
    const repository =
      manager?.getRepository(Game) ?? this.gamesEntityRepository;

    return repository
      .createQueryBuilder('game')
      .where('game.status = :status', {
        status: GameStatus.PendingSecondPlayer,
      })
      .setLock('pessimistic_write')
      .getOne();
  }

  async findActiveByUserId(
    userId: string,
    manager?: EntityManager,
  ): Promise<Game | null> {
    const repository =
      manager?.getRepository(Game) ?? this.gamesEntityRepository;

    return repository
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

  async save(game: Game, manager?: EntityManager): Promise<void> {
    await (manager?.getRepository(Game) ?? this.gamesEntityRepository).save(
      game,
    );
  }
}
