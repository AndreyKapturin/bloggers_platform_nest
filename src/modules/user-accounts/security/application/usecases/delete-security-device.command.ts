import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeviceSessionsRepository } from '../../../auth/infrastructure/DeviceSessions.repository';
import {
  DomainException,
  DomainExceptionStatus,
} from '../../../../../core/exceptions/DomainException';

export class DeleteSecurityDeviceCommand {
  constructor(
    public deviceId: string,
    public userId: string,
  ) {}
}

@CommandHandler(DeleteSecurityDeviceCommand)
export class DeleteSecurityDeviceUseCase implements ICommandHandler<
  DeleteSecurityDeviceCommand,
  void
> {
  constructor(private deviceSessionRepository: DeviceSessionsRepository) {}

  async execute(command: DeleteSecurityDeviceCommand): Promise<void> {
    const { deviceId, userId } = command;

    const deviceSession =
      await this.deviceSessionRepository.findDeviceById(deviceId);

    if (!deviceSession) {
      throw new DomainException(
        DomainExceptionStatus.NotFound,
        'Device not found',
        [
          {
            field: 'deviceId',
            message: `Device with id ${deviceId} not found`,
          },
        ],
      );
    }

    if (deviceSession.userId !== userId) {
      throw new DomainException(
        DomainExceptionStatus.PermissionError,
        'User does not have permission to delete device',
        [
          {
            field: 'deviceId',
            message: `Device with id ${deviceId} not belong to your account`,
          },
        ],
      );
    }

    await this.deviceSessionRepository.delete(deviceSession);
  }
}
