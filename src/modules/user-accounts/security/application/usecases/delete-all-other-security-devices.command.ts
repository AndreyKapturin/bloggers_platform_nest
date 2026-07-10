import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeviceSessionsRepository } from '../../../auth/infrastructure/DeviceSessions.repository';

export class DeleteAllOtherSecurityDevicesCommand {
  constructor(
    public deviceId: string,
    public userId: string,
  ) {}
}

@CommandHandler(DeleteAllOtherSecurityDevicesCommand)
export class DeleteAllOtherSecurityDeviceUseCase implements ICommandHandler<
  DeleteAllOtherSecurityDevicesCommand,
  void
> {
  constructor(private deviceSessionRepository: DeviceSessionsRepository) {}

  async execute(command: DeleteAllOtherSecurityDevicesCommand): Promise<void> {
    const { deviceId, userId } = command;

    const activeDeviceSessions =
      await this.deviceSessionRepository.findAllActiveForUser(userId);

    const activeDeviceSessionsWithoutThisDevice = activeDeviceSessions.filter(
      (session) => {
        return session.deviceId !== deviceId;
      },
    );

    const deviceIds = activeDeviceSessionsWithoutThisDevice.map(
      (ad) => ad.deviceId,
    );

    await this.deviceSessionRepository.deleteMany(deviceIds);
  }
}
