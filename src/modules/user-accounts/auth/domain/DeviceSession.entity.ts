import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { DomainCreateDeviceSessionDto } from './dto/DomainCreateDeviceSession.dto';

@Schema({ timestamps: true })
export class DeviceSession {
  @Prop({ type: String, required: true })
  userId!: string;

  @Prop({ type: String, required: true })
  deviceId!: string;

  @Prop({ type: String, required: true })
  deviceName!: string;

  @Prop({ type: String, required: true })
  ip!: string;

  @Prop({ type: Date, required: true })
  tokenIat!: Date;

  @Prop({ type: Date, required: true })
  tokenExp!: Date;

  createdAt!: Date;
  updatedAt!: Date;

  static makeInstance(
    dto: DomainCreateDeviceSessionDto,
  ): TDeviceSessionDocument {
    const deviceSession = new this();
    deviceSession.userId = dto.userId;
    deviceSession.deviceId = dto.deviceId;
    deviceSession.deviceName = dto.deviceName;
    deviceSession.ip = dto.ip;
    deviceSession.tokenIat = dto.tokenIat;
    deviceSession.tokenExp = dto.tokenExp;
    return deviceSession as TDeviceSessionDocument;
  }

  updateTokenIatAndExp(tokenIat: Date, tokenExp: Date): void {
    this.tokenIat = tokenIat;
    this.tokenExp = tokenExp;
  }
}

export const DeviceSessionSchema = SchemaFactory.createForClass(DeviceSession);
DeviceSessionSchema.loadClass(DeviceSession);
export type TDeviceSessionDocument = HydratedDocument<DeviceSession>;
export type TDeviceSessionModel = Model<DeviceSession> & typeof DeviceSession;
