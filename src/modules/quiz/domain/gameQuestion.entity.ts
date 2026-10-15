import { Entity, ManyToOne, JoinColumn, Column } from 'typeorm';
import { BaseDbEntity } from '../../../core/BaseDbEntity';
import { Question } from './question.entity';
import { Game } from './game.entity';
import { DomainCreateGameQuestionDto } from './dto/DomainCreateGameQuestion.dto';

@Entity('gameQuestions')
export class GameQuestion extends BaseDbEntity {
  @ManyToOne(() => Question, { nullable: false })
  @JoinColumn({ name: 'questionId' })
  question!: Question;

  @Column({ type: 'varchar', name: 'questionId', nullable: false })
  questionId!: string;

  @ManyToOne(() => Game, (game) => game.questions)
  @JoinColumn({ name: 'gameId' })
  game!: Game;
  
  @Column({ type: 'varchar', name: 'gameId', nullable: false })
  gameId!: string;

  static create(dto: DomainCreateGameQuestionDto): GameQuestion {
    const gameQuestion = new this();
    gameQuestion.questionId = dto.questionId;
    gameQuestion.gameId = dto.gameId;
    return gameQuestion;
  }
}
