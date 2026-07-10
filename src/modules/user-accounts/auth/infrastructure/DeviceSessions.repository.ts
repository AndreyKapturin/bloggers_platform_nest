import { Injectable } from '@nestjs/common';
import {
  DeviceSession,
  TDeviceSessionModel,
} from '../domain/DeviceSession.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class DeviceSessionsRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(DeviceSession)
    private readonly deviceSessionEntityRepo: Repository<DeviceSession>,
  ) {}

  async save(deviceSession: DeviceSession): Promise<void> {
    await this.deviceSessionEntityRepo.save(deviceSession);
  }

  async findByDeviceIdAndUserId(
    deviceId: string,
    userId: string,
  ): Promise<DeviceSession | null> {
    return this.deviceSessionEntityRepo.findOneBy({ deviceId, userId });
  }

  async delete(deviceId: string): Promise<void> {
    await this.dataSource.query<TDeviceSessionModel[]>(
      `DELETE FROM "deviceSessions" 
      WHERE "deviceId" = $1`,
      [deviceId],
    );
  }
}
