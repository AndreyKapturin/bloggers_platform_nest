import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '../domain/question.entity';

@Injectable()
export class QuestionsRepository {
  constructor(
    @InjectRepository(Question)
    private questionEntityRepository: Repository<Question>,
  ) {}

  async save(question: Question): Promise<Question> {
    return this.questionEntityRepository.save(question);
  }
}
