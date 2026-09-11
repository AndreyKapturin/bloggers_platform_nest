import { DeviceSession } from '../../../auth/domain/DeviceSession.entity';

export class ViewSecurityDevice {
  private constructor(
    public ip: string,
    public title: string,
    public lastActiveDate: string,
    public deviceId: string,
  ) {}

  static toView(
    deviceSession: DeviceSession,
  ): ViewSecurityDevice {
    return new this(
      deviceSession.ip,
      deviceSession.deviceName,
      deviceSession.tokenIat.toISOString(),
      deviceSession.deviceId,
    );
  }
}
