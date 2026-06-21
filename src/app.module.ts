// configModule must be imported before all other modules
import { configModule } from './modules/config/config.module';
import { DynamicModule, Module } from '@nestjs/common';
import { UserAccountsModule } from './modules/user-accounts/user-accounts.module';
import { BloggersPlatformModule } from './modules/bloggers-platform/bloggers-platform.module';
import { TestingController } from './modules/testing/testing.controller';
import { TestingModule } from './modules/testing/testing.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { CoreConfig } from './core/core.config';
import { CoreModule } from './core/core.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PgConfig } from './modules/postgre/postgre.config';

@Module({
  imports: [
    configModule,
    CoreModule,
    TypeOrmModule.forRootAsync({
      extraProviders: [PgConfig],
      inject: [PgConfig],
      useFactory: (config: PgConfig) => {
        return {
          type: 'postgres',
          host: config.host,
          port: config.port,
          database: config.database,
          username: config.user,
          password: config.password,
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
