import { Injectable } from '@nestjs/common';
import { DeviceSession } from '../domain/DeviceSession.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class DeviceSessionsRepository {
  constructor(
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

  async delete(deviceSession: DeviceSession): Promise<void> {
    await this.deviceSessionEntityRepo.remove(deviceSession);
  }
}
