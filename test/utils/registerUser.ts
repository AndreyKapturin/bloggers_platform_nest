import { INestApplication, HttpStatus } from '@nestjs/common';
import request, { Response } from 'supertest';
import { InputCreateUserDto } from '../../src/modules/user-accounts/users/dto/CreateUser.input-dto';

export const registerUser = async (
  app: INestApplication,
  inputCreateUserDto: InputCreateUserDto,
): Promise<Response> => {
  return await request(app.getHttpServer())
    .post('/auth/registration')
    .send(inputCreateUserDto)
    .expect(HttpStatus.CREATED);
};
