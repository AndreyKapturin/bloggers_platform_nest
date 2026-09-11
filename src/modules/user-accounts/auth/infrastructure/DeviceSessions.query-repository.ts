import { Injectable } from '@nestjs/common';
import { DeviceSession } from '../domain/DeviceSession.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { ViewSecurityDevice } from '../../security/api/dto/ViewSecurityDevice.dto';

@Injectable()
export class DeviceSessionsQueryRepository {
  constructor(
    @InjectRepository(DeviceSession)
    private readonly deviceSessionEntityRepo: Repository<DeviceSession>,
  ) {}

  async findAllActiveForUser(userId: string): Promise<ViewSecurityDevice[]> {
    const deviceSessions = await this.deviceSessionEntityRepo.find({
      where: { userId, tokenExp: MoreThan(new Date()) },
    });
    return deviceSessions.map((session) => ViewSecurityDevice.toView(session));
  }
}
