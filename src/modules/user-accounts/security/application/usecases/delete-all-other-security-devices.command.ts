import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityDevicesRepository } from '../../infrastructure/SecurityDevices.repository';

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
  constructor(private deviceSessionRepository: SecurityDevicesRepository) {}

  async execute(command: DeleteAllOtherSecurityDevicesCommand): Promise<void> {
    const { deviceId, userId } = command;

    const activeDeviceSessions =
      await this.deviceSessionRepository.findAllActiveForUser(userId);

    const activeDeviceSessionsWithoutThisDevice = activeDeviceSessions.filter(
      (session) => {
        return session.deviceId !== deviceId;
      },
    );

    for (const activeSession of activeDeviceSessionsWithoutThisDevice) {
      await this.deviceSessionRepository.delete(activeSession);
    }
  }
}
