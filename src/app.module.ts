import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserAccountsModule } from './modules/user-accounts/user-accounts.module';
import { MongooseModule } from '@nestjs/mongoose';
const MONGO_URI = 'mongodb://0.0.0.0:27017/bloggers_platform';

@Module({
  imports: [MongooseModule.forRoot(MONGO_URI), UserAccountsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
