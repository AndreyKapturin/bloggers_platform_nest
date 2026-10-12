import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { ViewQuestionDto } from '../../api/dto/ViewQuestion.view-dto';
import { QuestionsQueryRepository } from '../../infrastructure/questions.query-repository';
import { QuestionsQueryParamsDto } from '../../api/dto/QuestionsQueryParams.dto';
import { PaginatedView } from '../../../../core/dto/PaginatedView.dto';

export class GetQuestionsQuery extends Query<PaginatedView<ViewQuestionDto>> {
  constructor(public queryParams: QuestionsQueryParamsDto) {
    super();
  }
}

@QueryHandler(GetQuestionsQuery)
export class GetQuestionsQueryHandler implements IQueryHandler<
  GetQuestionsQuery,
  PaginatedView<ViewQuestionDto>
> {
  constructor(private questionsQueryRepository: QuestionsQueryRepository) {}

  execute(query: GetQuestionsQuery): Promise<PaginatedView<ViewQuestionDto>> {
    return this.questionsQueryRepository.find(query.queryParams);
  }
}
