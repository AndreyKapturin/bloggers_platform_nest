import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { EmailService } from '../../src/modules/notification/email.service';
import { fakeEmailService } from './mocks/fakeEmailService';

export type AdditionalBuildStep = (builder: TestingModuleBuilder) => void;

export async function initApp(
  additionalBuildStep?: AdditionalBuildStep,
): Promise<INestApplication> {
  const testingModuleBuilder: TestingModuleBuilder = Test.createTestingModule({
    imports: [AppModule],
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
