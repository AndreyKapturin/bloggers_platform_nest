import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Player } from '../domain/player.entity';

@Injectable()
export class PlayersRepository {
  constructor(
    @InjectRepository(Player)
    private readonly playersEntityRepository: Repository<Player>,
  ) {}

  async save(player: Player, manager?: EntityManager): Promise<void> {
    await (manager?.getRepository(Player) ?? this.playersEntityRepository).save(
      player,
    );
  }
}
