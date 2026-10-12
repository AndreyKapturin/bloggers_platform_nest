import { Entity, Column, UpdateDateColumn } from 'typeorm';
import { BaseDbEntity } from '../../../core/BaseDbEntity';
import { DomainCreateQuestionDto } from './dto/DomainCreateQuestion.dto';

@Entity('questions')
export class Question extends BaseDbEntity {
  @Column({
    type: 'varchar',
    nullable: false,
  })
  body!: string;

  @Column({
    type: 'json',
    nullable: false,
  })
  correctAnswers!: string[];

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
  })
  published!: boolean;

  @UpdateDateColumn()
  updatedAt!: Date;

  static create(dto: DomainCreateQuestionDto): Question {
    const question = new this();
    question.body = dto.body;
    question.correctAnswers = dto.correctAnswers;
    question.published = false;
    return question;
  }
}
