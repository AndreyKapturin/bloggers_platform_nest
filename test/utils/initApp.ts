import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { Test, TestingModule } from '@nestjs/testing';

export async function initApp(): Promise<INestApplication> {
  const testingModule: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  return testingModule.createNestApplication();
}