export class CreateUnconfirmedUserDto {
  login!: string;
  email!: string;
  passwordHash!: string;
  confirmationCode!: string;
  codeExpirationDate!: Date;
}
