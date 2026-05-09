export class LoginDto {
  constructor(
    public userId: string,
    public ip: string,
    public deviceName: string,
  ) {}
}