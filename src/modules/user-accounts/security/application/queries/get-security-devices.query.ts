import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { ViewSecurityDevice } from '../../api/dto/ViewSecurityDevice.dto';
import { DeviceSessionsQueryRepository } from '../../../auth/infrastructure/DeviceSessions.query-repository';

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
    private deviceSessionsQueryRepository: DeviceSessionsQueryRepository,
  ) {}
  execute(query: GetSecurityDevicesQuery): Promise<ViewSecurityDevice[]> {
    return this.deviceSessionsQueryRepository.findAllActiveForUser(
      query.userId,
    );
  }
}
