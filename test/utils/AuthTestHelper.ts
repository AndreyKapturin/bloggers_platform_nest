import { INestApplication, HttpStatus } from '@nestjs/common';
import request, { Response } from 'supertest';
import { InputCreateUserDto } from '../../src/modules/user-accounts/users/dto/CreateUser.input-dto';

export class AuthTestHelper {
  constructor(private app: INestApplication) {}

  async registerUser(
    inputCreateUserDto: InputCreateUserDto,
    options?: { status: HttpStatus },
  ): Promise<Response> {
    return await request(this.app.getHttpServer())
      .post('/auth/registration')
      .send(inputCreateUserDto)
      .expect(options?.status ?? HttpStatus.NO_CONTENT);
  }
}
