import { Response } from 'supertest';
export type ResponseWithBody<T> = Omit<Response, 'body'> & { body: T };
