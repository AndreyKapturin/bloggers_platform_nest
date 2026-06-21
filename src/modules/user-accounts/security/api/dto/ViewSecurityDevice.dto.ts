import { TDeviceSessionModel } from '../../../auth/domain/DeviceSession.entity';

export class ViewSecurityDevice {
  private constructor(
    public ip: string,
    public title: string,
    public lastActiveDate: string,
    public deviceId: string,
  ) {}

  static toView(
    deviceSessionDocument: TDeviceSessionModel,
  ): ViewSecurityDevice {
    return new this(
      deviceSessionDocument.ip,
      deviceSessionDocument.deviceName,
      deviceSessionDocument.tokenIat.toISOString(),
      deviceSessionDocument.deviceId,
    );
  }
}
