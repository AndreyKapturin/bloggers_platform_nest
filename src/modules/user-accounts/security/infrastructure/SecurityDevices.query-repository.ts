import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  DeviceSession,
  type TDeviceSessionModel,
} from '../../auth/domain/DeviceSession.entity';
import { ViewSecurityDevice } from '../api/dto/ViewSecurityDevice.dto';

@Injectable()
export class SecurityDevicesQueryRepository {
  constructor(
    @InjectModel(DeviceSession.name)
    private DeviceSessionModel: TDeviceSessionModel,
  ) {}

  async findActiveDevicesForUser(
    userId: string,
  ): Promise<ViewSecurityDevice[]> {
    const activeSessions = await this.DeviceSessionModel.find({
      $and: [{ userId }, { tokenExp: { $gt: Date.now() } }],
    });
    return activeSessions.map((session) => ViewSecurityDevice.toView(session));
  }
}
