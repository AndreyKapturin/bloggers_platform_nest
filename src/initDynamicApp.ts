import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CoreConfig } from './core/core.config';

export async function initDynamicApp() {
  const appContext = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  const coreConfig = appContext.get(CoreConfig);
  appContext.close();

  return AppModule.forRootAsync(coreConfig);
}
