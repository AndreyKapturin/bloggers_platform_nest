import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { CryptoService } from '../../../../services/CryptoService';
import {
  DomainException,
  DomainExceptionStatus,
} from '../../../../core/exceptions/DomainException';
import { DeviceSessionsRepository } from '../infrastructure/DeviceSessions.repository';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
    private deviceSessionRepository: DeviceSessionsRepository,
  ) {}

  async validateUser(
    loginOrEmail: string,
    password: string,
  ): Promise<string | null> {
    const userDocument =
      await this.usersRepository.findByLoginOrEmail(loginOrEmail);

    if (!userDocument) return null;

    const isValidPassword = await this.cryptoService.compare(
      password,
      userDocument.passwordHash,
    );

    if (isValidPassword) return userDocument.id;

    return null;
  }

  async logout(deviceId: string, userId: string): Promise<void> {
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
