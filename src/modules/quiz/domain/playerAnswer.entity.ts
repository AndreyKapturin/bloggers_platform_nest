import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Player } from './player.entity';
import { GameQuestion } from './gameQuestion.entity';
import { DomainCreatePlayerAnswerDto } from './dto/DomainCreatePlayerAnswer.dto';

export enum AnswerStatus {
  Correct = 'Correct',
  Incorrect = 'Incorrect',
}

@Entity('playerAnswers')
export class PlayerAnswer {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => Player, { nullable: false })
  @JoinColumn({ name: 'playerId' })
  player!: Player;

  @Column({ type: 'varchar', name: 'playerId', nullable: false })
  playerId!: string;

  @OneToOne(() => GameQuestion, { nullable: false })
  @JoinColumn({ name: 'gameQuestionId' })
  gameQuestion!: GameQuestion;

  @Column({ type: 'varchar', name: 'gameQuestionId', nullable: false })
  gameQuestionId!: string;

  @Column({ type: 'varchar', enum: AnswerStatus })
  status!: AnswerStatus;

  @CreateDateColumn()
  createdAt!: Date;

  static create(dto: DomainCreatePlayerAnswerDto): PlayerAnswer {
    const answer = new this();
    answer.status = dto.status;
    answer.gameQuestionId = dto.gameQuestionId;
    answer.playerId = dto.playerId;
    return answer;
  }
}
