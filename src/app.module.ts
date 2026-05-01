import { Module } from '@nestjs/common';
import { UserAccountsModule } from './modules/user-accounts/user-accounts.module';
import { MongooseModule } from '@nestjs/mongoose';
import { BloggersPlatformModule } from './modules/bloggers-platform/bloggers-platform.module';
import { TestingController } from './modules/testing/testing.controller';
import { TestingModule } from './modules/testing/testing.module';
import { CqrsModule } from '@nestjs/cqrs';
import { ThrottlerModule } from '@nestjs/throttler';
const MONGO_URI = 'mongodb://0.0.0.0:27017/bloggers_platform';

//TODO - move limit and ttl to env or config

@Module({
  imports: [
    MongooseModule.forRoot(MONGO_URI),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 10_000,
          limit: 5,
        },
      ],
    }),
    CqrsModule.forRoot(),
    UserAccountsModule,
    BloggersPlatformModule,
    TestingModule,
  ],
  controllers: [TestingController],
})
export class AppModule {}
