import { Injectable } from '@nestjs/common';
import { TDeviceSessionModel } from '../../auth/domain/DeviceSession.entity';
import { ViewSecurityDevice } from '../api/dto/ViewSecurityDevice.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class SecurityDevicesQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findActiveDevicesForUser(
    userId: string,
  ): Promise<ViewSecurityDevice[]> {
    const activeSessions = await this.dataSource.query<TDeviceSessionModel[]>(
      `SELECT
        "userId",
        "deviceId",
        "deviceName",
        "ip",
        "tokenIat",
        "tokenExp"
      FROM "deviceSessions" 
      WHERE "userId" = $1 AND "tokenExp" > CURRENT_TIMESTAMP`,
      [userId],
    );
    return activeSessions.map((session) => ViewSecurityDevice.toView(session));
  }
}
