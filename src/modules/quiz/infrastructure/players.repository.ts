import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from '../domain/player.entity';

@Injectable()
export class PlayersRepository {
  constructor(
    @InjectRepository(Player)
    private readonly playersEntityRepository: Repository<Player>,
  ) {}

  async save(player: Player): Promise<void> {
    await this.playersEntityRepository.save(player);
  }
}
