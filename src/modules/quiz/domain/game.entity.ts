import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { Player } from './player.entity';
import { GameQuestion } from './gameQuestion.entity';

export enum GameStatus {
  PendingSecondPlayer = 'PendingSecondPlayer',
  Active = 'Active',
  Finished = 'Finished',
}

@Entity('games')
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', enum: GameStatus })
  status!: GameStatus;

  @CreateDateColumn({ name: 'pairCreatedDate', nullable: false })
  pairCreatedDate!: Date;

  @Column({ type: 'date', name: 'startGameDate', nullable: true })
  startGameDate!: Date;

  @Column({ type: 'date', name: 'finishGameDate', nullable: true })
  finishGameDate!: Date;

  @OneToMany(() => Player, (player) => player.game)
  players!: Player[];

  @OneToMany(() => GameQuestion, (gameQuestion) => gameQuestion.game)
  questions!: GameQuestion[];

  start() {
    this.status = GameStatus.Active;
    this.startGameDate = new Date();
  }

  static create(): Game {
    const game = new this();
    game.status = GameStatus.PendingSecondPlayer;
    game.pairCreatedDate = new Date();
    return game;
  }
}
