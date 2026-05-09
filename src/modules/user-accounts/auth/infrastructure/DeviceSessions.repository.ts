import { Injectable } from '@nestjs/common';
import {
  DeviceSession,
  type TDeviceSessionDocument,
  type TDeviceSessionModel,
} from '../domain/DeviceSession.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class DeviceSessionsRepository {
  constructor(
    @InjectModel(DeviceSession.name)
    private DeviceSessionModel: TDeviceSessionModel,
  ) {}

  async save(deviceSessionDocument: TDeviceSessionDocument): Promise<void> {
    await deviceSessionDocument.save();
  }

  async findByDeviceIdAndUserId(
    deviceId: string,
    userId: string,
  ): Promise<TDeviceSessionDocument | null> {
    const deviceSession = await this.DeviceSessionModel.findOne({
      deviceId,
      userId,
    });
    return deviceSession;
  }
}
