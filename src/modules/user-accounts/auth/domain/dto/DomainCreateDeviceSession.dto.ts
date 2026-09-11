import { User } from "../../../users/domain/user.entity";

export class DomainCreateDeviceSessionDto {
  constructor(
    public user: User,
    public deviceId: string,
    public deviceName: string,
    public ip: string,
    public tokenIat: Date,
    public tokenExp: Date,
  ) {}
}
