import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { ViewQuestionDto } from '../../api/dto/ViewQuestion.view-dto';
import { QuestionsQueryRepository } from '../../infrastructure/questions.query-repository';

export class GetQuestionQuery extends Query<ViewQuestionDto> {
  constructor(public questionId: string) {
    super();
  }
}

@QueryHandler(GetQuestionQuery)
export class GetQuestionQueryHandler implements IQueryHandler<
  GetQuestionQuery,
  ViewQuestionDto
> {
  constructor(private questionsQueryRepository: QuestionsQueryRepository) {}
  
  execute(query: GetQuestionQuery): Promise<ViewQuestionDto> {
    return this.questionsQueryRepository.findById(query.questionId);
  }
}
