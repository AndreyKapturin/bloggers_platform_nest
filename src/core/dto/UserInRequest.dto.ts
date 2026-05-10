export class UserInRequestDto {
  constructor(public userId: string) {}
}

export class UserWithDeviceInRequestDto extends UserInRequestDto {
  constructor(
    userId: string,
    public deviceId: string,
  ) {
    super(userId);
  }
}
