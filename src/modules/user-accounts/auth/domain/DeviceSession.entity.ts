export type TDeviceSessionModel = {
  userId: string;
  deviceId: string;
  deviceName: string;
  ip: string;
  tokenIat: Date;
  tokenExp: Date;
}