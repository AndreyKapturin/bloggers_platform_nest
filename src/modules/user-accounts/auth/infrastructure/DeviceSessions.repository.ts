import { Injectable } from '@nestjs/common';
import { DeviceSession } from '../domain/DeviceSession.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, MoreThan, Repository } from 'typeorm';

@Injectable()
export class DeviceSessionsRepository {
  constructor(
    @InjectRepository(DeviceSession)
    private readonly deviceSessionEntityRepo: Repository<DeviceSession>,
  ) {}

  async save(deviceSession: DeviceSession): Promise<void> {
    await this.deviceSessionEntityRepo.save(deviceSession);
  }

  async findAllActiveForUser(userId: string): Promise<DeviceSession[]> {
    return this.deviceSessionEntityRepo.find({
      where: { userId, tokenExp: MoreThan(new Date()) },
    });
  }

  async findDeviceById(deviceId: string): Promise<DeviceSession | null> {
    return this.deviceSessionEntityRepo.findOneBy({ deviceId });
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

  async deleteMany(deviceIds: string[]): Promise<void> {
    await this.deviceSessionEntityRepo.delete({ deviceId: In(deviceIds) });
  }
}
