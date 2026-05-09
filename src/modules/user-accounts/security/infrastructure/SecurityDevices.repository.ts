import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  DeviceSession,
  TDeviceSessionDocument,
  type TDeviceSessionModel,
} from '../../auth/domain/DeviceSession.entity';

@Injectable()
export class SecurityDevicesRepository {
  constructor(
    @InjectModel(DeviceSession.name)
    private DeviceSessionModel: TDeviceSessionModel,
  ) {}

  async findAllActiveForUser(
    userId: string,
  ): Promise<TDeviceSessionDocument[]> {
    return this.DeviceSessionModel.find({
      $and: [{ userId }, { tokenExpAt: { $gt: Date.now() } }],
    });
  }

  async findDeviceById(
    deviceId: string,
  ): Promise<TDeviceSessionDocument | null> {
    return this.DeviceSessionModel.findOne({
      $and: [{ deviceId }, { tokenExpAt: { $gt: Date.now() } }],
    });
  }

  async delete(deviceSessionDocument: TDeviceSessionDocument): Promise<void> {
    await deviceSessionDocument.deleteOne();
  }
}
