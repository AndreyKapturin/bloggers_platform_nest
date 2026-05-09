import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityDevicesRepository } from '../../infrastructure/SecurityDevices.repository';
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
  constructor(private deviceSessionRepository: SecurityDevicesRepository) {}

  async execute(command: DeleteSecurityDeviceCommand): Promise<void> {
    const { deviceId, userId } = command;

    const foundDeviceSession =
      await this.deviceSessionRepository.findDeviceById(deviceId);

    if (!foundDeviceSession) {
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

    if (foundDeviceSession.userId !== userId) {
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

    await this.deviceSessionRepository.delete(foundDeviceSession);
  }
}
