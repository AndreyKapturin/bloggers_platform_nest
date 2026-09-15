import { Injectable, OnApplicationShutdown, Logger } from '@nestjs/common';
import { AppDataSource } from './data.source';

@Injectable()
export class TypeormShutdownService implements OnApplicationShutdown {
  private readonly logger = new Logger(TypeormShutdownService.name);

  async onApplicationShutdown(): Promise<void> {
    if (AppDataSource.isInitialized) {
      this.logger.log('Closing external AppDataSource...');
      await AppDataSource.destroy();
      this.logger.log('External AppDataSource closed.');
    }
  }
}