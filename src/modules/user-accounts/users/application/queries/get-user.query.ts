import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { ViewUserDto } from '../../api/dto/ViewUser.dto';
import { UsersQueryRepository } from '../../infrastructure/users.query-repository';

export class GetUserQuery extends Query<ViewUserDto> {
  constructor(public userId: string) {
    super();
  }
}

@QueryHandler(GetUserQuery)
export class GetUserQueryHandler implements IQueryHandler<
  GetUserQuery,
  ViewUserDto
> {
  constructor(private usersQueryRepository: UsersQueryRepository) {}

  execute(query: GetUserQuery): Promise<ViewUserDto> {
    return this.usersQueryRepository.findByIdOrThrow(query.userId);
  }
}
