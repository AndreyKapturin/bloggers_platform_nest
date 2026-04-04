import { Module } from '@nestjs/common';
import { UserAccountsModule } from './modules/user-accounts/user-accounts.module';
import { MongooseModule } from '@nestjs/mongoose';
import { BloggersPlatformModule } from './modules/bloggers-platform/bloggers-platform.module';
import { TestingController } from './modules/testing/testing.controller';
import { TestingModule } from './modules/testing/testing.module';
const MONGO_URI = 'mongodb://0.0.0.0:27017/bloggers_platform';

@Module({
  imports: [
    MongooseModule.forRoot(MONGO_URI),
    UserAccountsModule,
    BloggersPlatformModule,
    TestingModule,
  ],
  controllers: [TestingController],
})
export class AppModule {}
