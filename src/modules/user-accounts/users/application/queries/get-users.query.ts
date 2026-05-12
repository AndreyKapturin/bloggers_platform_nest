import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { ViewUserDto } from '../../api/dto/ViewUser.dto';
import { UsersQueryRepository } from '../../infrastructure/users.query-repository';
import { UserQueryParamsDto } from '../../api/dto/UserQueryParams.dto';
import { PaginatedView } from '../../../../../core/dto/PaginatedView.dto';

export class GetUsersQuery extends Query<PaginatedView<ViewUserDto>> {
  constructor(public queryParams: UserQueryParamsDto) {
    super();
  }
}

@QueryHandler(GetUsersQuery)
export class GetUsersQueryHandler implements IQueryHandler<
  GetUsersQuery,
  PaginatedView<ViewUserDto>
> {
  constructor(private usersQueryRepository: UsersQueryRepository) {}

  execute(query: GetUsersQuery): Promise<PaginatedView<ViewUserDto>> {
    return this.usersQueryRepository.find(query.queryParams);
  }
}
