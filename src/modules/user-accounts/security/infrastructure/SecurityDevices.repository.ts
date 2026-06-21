import { Injectable } from '@nestjs/common';
import { TDeviceSessionModel } from '../../auth/domain/DeviceSession.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class SecurityDevicesRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findAllActiveForUser(userId: string): Promise<TDeviceSessionModel[]> {
    return this.dataSource.query<TDeviceSessionModel[]>(
      `SELECT
        "userId",
        "deviceId",
        "deviceName",
        "ip",
        "tokenIat",
        "tokenExp"
      FROM
	      "deviceSessions"
      WHERE
	      "userId" = $1 AND "tokenExp" > CURRENT_TIMESTAMP`,
      [userId],
    );
  }

  async findDeviceById(deviceId: string): Promise<TDeviceSessionModel | null> {
    const rows = await this.dataSource.query<TDeviceSessionModel[]>(
      `SELECT
        "userId",
        "deviceId",
        "deviceName",
        "ip",
        "tokenIat",
        "tokenExp"
      FROM
	      "deviceSessions"
      WHERE
	      "deviceId" = $1 AND "tokenExp" > CURRENT_TIMESTAMP
      LIMIT 1`,
      [deviceId],
    );

    return rows[0] ?? null;
  }

  async delete(deviceId: string): Promise<void> {
    await this.dataSource.query<TDeviceSessionModel[]>(
      `DELETE FROM "deviceSessions" 
      WHERE "deviceId" = $1`,
      [deviceId],
    );
  }

  async deleteMany(deviceIds: string[]): Promise<void> {
    await this.dataSource.query<TDeviceSessionModel[]>(
      `DELETE FROM "deviceSessions" 
      WHERE "deviceId" = ANY($1)`,
      [deviceIds],
    );
  }
}
