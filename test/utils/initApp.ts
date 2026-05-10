import { INestApplication } from '@nestjs/common';
import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { EmailService } from '../../src/modules/notification/email.service';
import { fakeEmailService } from './mocks/fakeEmailService';
import { initDynamicApp } from '../../src/initDynamicApp';

export type AdditionalBuildStep = (builder: TestingModuleBuilder) => void;

export async function initApp(
  additionalBuildStep?: AdditionalBuildStep,
): Promise<INestApplication> {
  const DynamicAppModule = await initDynamicApp();
  const testingModuleBuilder: TestingModuleBuilder = Test.createTestingModule({
    imports: [DynamicAppModule],
  });

  testingModuleBuilder
    .overrideProvider(EmailService)
    .useValue(fakeEmailService);

  if (additionalBuildStep) {
    additionalBuildStep(testingModuleBuilder);
  }

  const testingModule: TestingModule = await testingModuleBuilder.compile();
  return testingModule.createNestApplication();
}
