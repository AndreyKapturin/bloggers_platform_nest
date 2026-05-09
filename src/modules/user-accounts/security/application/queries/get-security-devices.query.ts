import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { ViewSecurityDevice } from '../../api/dto/ViewSecurityDevice.dto';
import { SecurityDevicesQueryRepository } from '../../infrastructure/SecurityDevices.query-repository';

export class GetSecurityDevicesQuery extends Query<ViewSecurityDevice[]> {
  constructor(public userId: string) {
    super();
  }
}

@QueryHandler(GetSecurityDevicesQuery)
export class GetSecurityDevicesQueryHandler implements IQueryHandler<
  GetSecurityDevicesQuery,
  ViewSecurityDevice[]
> {
  constructor(
    private securityDevicesQueryRepository: SecurityDevicesQueryRepository,
  ) {}
  execute(query: GetSecurityDevicesQuery): Promise<ViewSecurityDevice[]> {
    return this.securityDevicesQueryRepository.findActiveDevicesForUser(
      query.userId,
    );
  }
}
