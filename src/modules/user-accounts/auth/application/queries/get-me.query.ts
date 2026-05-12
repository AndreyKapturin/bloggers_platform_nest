import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { UsersQueryRepository } from '../../../users/infrastructure/users.query-repository';
import { ViewMeDto } from '../../../users/api/dto/ViewMe.dto';

export class GetMeQuery extends Query<ViewMeDto> {
  constructor(public userId: string) {
    super();
  }
}

@QueryHandler(GetMeQuery)
export class GetMeQueryHandler implements IQueryHandler<GetMeQuery, ViewMeDto> {
  constructor(private usersQueryRepository: UsersQueryRepository) {}

  execute(query: GetMeQuery): Promise<ViewMeDto> {
    return this.usersQueryRepository.getMe(query.userId);
  }
}
