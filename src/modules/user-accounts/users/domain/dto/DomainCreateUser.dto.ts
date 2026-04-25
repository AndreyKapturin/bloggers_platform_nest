export class DomainCreateUserDto {
  constructor(
    public login: string,
    public email: string,
    public passwordHash: string,
  ) {}
}
