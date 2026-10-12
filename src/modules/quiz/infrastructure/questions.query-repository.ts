import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Question } from '../domain/question.entity';
import { ViewQuestionDto } from '../api/dto/ViewQuestion.view-dto';
import { QuestionsQueryParamsDto } from '../api/dto/QuestionsQueryParams.dto';
import { PaginatedView } from '../../../core/dto/PaginatedView.dto';

@Injectable()
export class QuestionsQueryRepository {
  constructor(
    @InjectRepository(Question)
    private questionEntityRepository: Repository<Question>,
  ) {}

  async find(
    query: QuestionsQueryParamsDto,
  ): Promise<PaginatedView<ViewQuestionDto>> {
    const {
      pageNumber,
      pageSize,
      bodySearchTerm,
      skip,
      sortBy,
      sortDirection,
    } = query;

    const [questions, totalCount] =
      await this.questionEntityRepository.findAndCount({
        where: {
          body: bodySearchTerm ? ILike(`%${bodySearchTerm}%`) : undefined,
        },
        order: { [sortBy]: sortDirection },
        take: pageSize,
        skip,
      });

    const viewQuestions = questions.map((question) =>
      ViewQuestionDto.toView(question),
    );
    const paginatedQuestions = PaginatedView.toView(
      pageNumber,
      pageSize,
      totalCount,
      viewQuestions,
    );
    return paginatedQuestions;
  }

  async findById(id: string): Promise<ViewQuestionDto> {
    const question = await this.questionEntityRepository.findOneBy({ id });

    if (!question) {
      throw new NotFoundException(`Question with id ${id} not found`);
    }

    return ViewQuestionDto.toView(question);
  }
}
