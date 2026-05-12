import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeviceSessionsRepository } from '../../infrastructure/DeviceSessions.repository';
import {
  DomainException,
  DomainExceptionStatus,
} from '../../../../../core/exceptions/DomainException';

export class LogoutCommand extends Command<void> {
  constructor(
    public deviceId: string,
    public userId: string,
  ) {
    super();
  }
}

@CommandHandler(LogoutCommand)
export class LogoutUseCase implements ICommandHandler<LogoutCommand, void> {
  constructor(private deviceSessionRepository: DeviceSessionsRepository) {}

  async execute(command: LogoutCommand): Promise<void> {
    const { deviceId, userId } = command;
    const deviceSession =
      await this.deviceSessionRepository.findByDeviceIdAndUserId(
        deviceId,
        userId,
      );

    if (!deviceSession) {
      throw new DomainException(
        DomainExceptionStatus.InvalidCredentials,
        'Invalid refresh token',
        [
          {
            field: 'refreshToken',
            message: 'Invalid refresh token',
          },
        ],
      );
    }

    await this.deviceSessionRepository.delete(deviceSession);
  }
}
