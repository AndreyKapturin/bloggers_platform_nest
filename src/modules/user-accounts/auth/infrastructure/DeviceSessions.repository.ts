import { Injectable } from '@nestjs/common';
import { TDeviceSessionModel } from '../domain/DeviceSession.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DomainCreateDeviceSessionDto } from '../domain/dto/DomainCreateDeviceSession.dto';

@Injectable()
export class DeviceSessionsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async save(deviceSessionModel: DomainCreateDeviceSessionDto): Promise<void> {
    await this.dataSource.query(
      `INSERT INTO
	      "deviceSessions" 
      (
        "userId",
        "deviceId",
        "deviceName",
        "ip",
        "tokenIat",
        "tokenExp"
      )
      VALUES ($1,$2,$3,$4,$5,$6);`,
      [
        deviceSessionModel.userId,
        deviceSessionModel.deviceId,
        deviceSessionModel.deviceName,
        deviceSessionModel.ip,
        deviceSessionModel.tokenIat,
        deviceSessionModel.tokenExp,
      ],
    );
  }

  async findByDeviceIdAndUserId(
    deviceId: string,
    userId: string,
  ): Promise<TDeviceSessionModel | null> {
    const rows = await this.dataSource.query<TDeviceSessionModel[]>(
      `SELECT
        "userId",
        "deviceId",
        "deviceName",
        "ip",
        "tokenIat",
        "tokenExp"
      FROM "deviceSessions" 
      WHERE "deviceId" = $1 AND "userId" = $2
      LIMIT 1`,
      [deviceId, userId],
    );

    return rows[0] ?? null;
  }

  async updateTokenIatAndExp(
    deviceId: string,
    userId: string,
    tokenIat: Date,
    tokenExp: Date,
  ): Promise<void> {
    await this.dataSource.query<TDeviceSessionModel[]>(
      `UPDATE "deviceSessions" 
      SET "tokenIat" = $1, "tokenExp" = $2
      WHERE "deviceId" = $3 AND "userId" = $4`,
      [tokenIat, tokenExp, deviceId, userId],
    );
  }

  async delete(deviceId: string): Promise<void> {
    await this.dataSource.query<TDeviceSessionModel[]>(
      `DELETE FROM "deviceSessions" 
      WHERE "deviceId" = $1`,
      [deviceId],
    );
  }
}
