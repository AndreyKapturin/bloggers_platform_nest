import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from '../../users/domain/user.entity';
import { DomainCreateDeviceSessionDto } from './dto/DomainCreateDeviceSession.dto';

export type TDeviceSessionModel = {
  userId: string;
  deviceId: string;
  deviceName: string;
  ip: string;
  tokenIat: Date;
  tokenExp: Date;
};

@Entity({ name: 'deviceSessions' })
export class DeviceSession {
  @PrimaryColumn('uuid')
  deviceId!: string;

  @Column({ type: 'varchar', nullable: false })
  deviceName!: string;

  @Column({ type: 'varchar', nullable: false })
  ip!: string;

  @Column({ type: 'timestamptz', nullable: false })
  tokenIat!: Date;

  @Column({ type: 'timestamptz', nullable: false })
  tokenExp!: Date;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'uuid', nullable: false })
  userId!: string;

  static create(dto: DomainCreateDeviceSessionDto): DeviceSession {
    const deviceSession = new this();
    deviceSession.deviceId = dto.deviceId;
    deviceSession.deviceName = dto.deviceName;
    deviceSession.ip = dto.ip;
    deviceSession.tokenExp = dto.tokenExp;
    deviceSession.tokenIat = dto.tokenIat;
    deviceSession.user = dto.user;
    return deviceSession;
  }
}
