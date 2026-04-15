import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { InputCreateUserDto } from '../../src/modules/user-accounts/users/dto/CreateUser.input-dto';
import { ADMIN_LOGIN, ADMIN_PASSWORD } from '../../src/core/constants';

export const createUser = async (
  app: INestApplication,
  dto: InputCreateUserDto,
  options?: { status: HttpStatus },
) => {
  return request(app.getHttpServer())
    .post('/users')
    .auth(ADMIN_LOGIN, ADMIN_PASSWORD, { type: 'basic' })
    .send(dto)
    .expect(options?.status ?? HttpStatus.CREATED);
};
