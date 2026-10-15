import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '../domain/question.entity';
import {
  DomainException,
  DomainExceptionStatus,
} from '../../../core/exceptions/DomainException';

@Injectable()
export class QuestionsRepository {
  constructor(
    @InjectRepository(Question)
    private questionEntityRepository: Repository<Question>,
  ) {}

  async findById(id: string): Promise<Question | null> {
    return this.questionEntityRepository.findOne({ where: { id } });
  }

  async findByIdOrThrow(id: string): Promise<Question> {
    const question = await this.findById(id);

    if (!question) {
      throw new DomainException(
        DomainExceptionStatus.NotFound,
        `Question with id ${id} not found`,
        [
          {
            field: 'questionId',
            message: `Question with id ${id} not found`,
          },
        ],
      );
    }

    return question;
  }

  async delete(question: Question): Promise<void> {
    await this.questionEntityRepository.remove(question);
  }

  async save(question: Question): Promise<Question> {
    return this.questionEntityRepository.save(question);
  }

  async getRandomQuestions(count: number): Promise<Question[]> {
    return this.questionEntityRepository
      .createQueryBuilder('q')
      .where('q.published = TRUE')
      .orderBy('RANDOM()')
      .limit(count)
      .getMany();
  }
}
