import {
  Entity,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { Game } from './game.entity';
import { User } from '../../user-accounts/users/domain/user.entity';
import { DomainCreatePlayerDto } from './dto/DomainCreatePlayer.dto';

export enum GameStatus {
  PendingSecondPlayer = 'PendingSecondPlayer',
  Active = 'Active',
  Finished = 'Finished',
}

@Entity('players')
export class Player {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'varchar', name: 'userId', nullable: false })
  userId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => Game, (game) => game.players, { nullable: false })
  @JoinColumn({ name: 'gameId' })
  game!: string;

  @Column({ type: 'varchar', name: 'gameId', nullable: false })
  gameId!: string;

  static create(dto: DomainCreatePlayerDto): Player {
    const player = new this();
    player.gameId = dto.gameId;
    player.userId = dto.userId;
    return player;
  }
}
