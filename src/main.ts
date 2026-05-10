import { NestFactory } from '@nestjs/core';
import { CoreConfig } from './core/core.config';
import { setupApp } from './core/setupApp';
import { initDynamicApp } from './initDynamicApp';

async function bootstrap() {
  const DynamicAppModule = await initDynamicApp();
  const app = await NestFactory.create(DynamicAppModule);
  const coreConfig = app.get(CoreConfig);
  setupApp(app);
  await app.listen(coreConfig.port);
}
bootstrap();
