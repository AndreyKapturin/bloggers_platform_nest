import { BaseQueryParamsDto } from '../../../../core/dto/BaseQueryParams.dto';

export enum QuestionsSortBy {
  CreatedAt = 'createdAt',
  Name = 'name',
}

export enum QuestionsPublishedStatus {
  All = 'all',
  Published = 'published',
  NotPublished = 'notPublished' 
}

export class QuestionsQueryParamsDto extends BaseQueryParamsDto {
  sortBy = QuestionsSortBy.CreatedAt;
  bodySearchTerm: string | null = null;
  publishedStatus: QuestionsPublishedStatus = QuestionsPublishedStatus.All;
}
