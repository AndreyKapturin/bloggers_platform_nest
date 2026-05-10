export class DomainCreateDeviceSessionDto {
  constructor(
    public userId: string,
    public deviceId: string,
    public deviceName: string,
    public ip: string,
    public tokenIat: Date,
    public tokenExp: Date,
  ) {}
}
