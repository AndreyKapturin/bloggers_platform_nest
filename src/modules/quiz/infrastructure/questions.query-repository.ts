import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '../domain/question.entity';
import { ViewQuestionDto } from '../api/dto/ViewQuestion.view-dto';

@Injectable()
export class QuestionsQueryRepository {
  constructor(
    @InjectRepository(Question)
    private questionEntityRepository: Repository<Question>,
  ) {}

  async findById(id: string): Promise<ViewQuestionDto> {
    const question = await this.questionEntityRepository.findOneBy({ id });

    if (!question) {
      throw new NotFoundException(`Question with id ${id} not found`);
    }

    return ViewQuestionDto.toView(question);
  }
}
