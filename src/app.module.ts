// configModule must be imported before all other modules
import { configModule } from './modules/config/config.module';
import { DynamicModule, Module } from '@nestjs/common';
import { UserAccountsModule } from './modules/user-accounts/user-accounts.module';
import { MongooseModule } from '@nestjs/mongoose';
import { BloggersPlatformModule } from './modules/bloggers-platform/bloggers-platform.module';
import { TestingController } from './modules/testing/testing.controller';
import { TestingModule } from './modules/testing/testing.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { CoreConfig } from './core/core.config';
import { CoreModule } from './core/core.module';

@Module({
  imports: [
    configModule,
    CoreModule,
    MongooseModule.forRootAsync({
      inject: [CoreConfig],
      useFactory: (coreConfig: CoreConfig) => {
        const uri = coreConfig.mongoUri;
        return {
          uri,
        };
      },
    }),
    ThrottlerModule.forRootAsync({
      inject: [CoreConfig],
      useFactory: (coreConfig: CoreConfig) => {
        return {
          throttlers: [
            {
              ttl: coreConfig.rateLimitTtlInMs,
              limit: coreConfig.rateLimitRequestsCount,
            },
          ],
        };
      },
    }),
    UserAccountsModule,
    BloggersPlatformModule,
  ],
  controllers: [TestingController],
})
export class AppModule {
  static async forRootAsync(coreConfig: CoreConfig): Promise<DynamicModule> {
    return {
      module: AppModule,
      imports: [...(coreConfig.isIncludeTestingModule ? [TestingModule] : [])],
    };
  }
}
