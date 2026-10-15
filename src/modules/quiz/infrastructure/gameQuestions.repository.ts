import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameQuestion } from '../domain/gameQuestion.entity';

@Injectable()
export class GameQuestionsRepository {
  constructor(
    @InjectRepository(GameQuestion)
    private gameQuestionEntityRepository: Repository<GameQuestion>,
  ) {}

  async save(gameQuestion: GameQuestion): Promise<void> {
    await this.gameQuestionEntityRepository.save(gameQuestion);
  }

  // async saveMany(gameQuestions: GameQuestion[]): Promise<void> {
  //   await Promise.all(gameQuestions.map((gq) => this.save(gq)));
  // }
  async saveMany(gameQuestions: GameQuestion[]): Promise<void> {
    await this.gameQuestionEntityRepository.save(gameQuestions);
  }
}
