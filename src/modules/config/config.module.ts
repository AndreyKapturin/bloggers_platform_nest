import { ConfigModule } from '@nestjs/config';
import { resolve, join } from 'path';

export enum Environments {
  Testing = 'testing',
  Development = 'development',
  Staging = 'staging',
  Production = 'production',
}

const envName = process.env.NODE_ENV?.trim() || '';

const environments = Object.values(Environments) as string[];

if (!environments.includes(envName)) {
  throw new Error(
    `Invalid environment name: ${envName}. Available environments are: ${environments.join(', ')}`,
  );
}

const envFilesFilderPath = resolve(__dirname, 'env');

export const configModule = ConfigModule.forRoot({
  envFilePath: [
    join(envFilesFilderPath, `.env.${envName}.local`),
    join(envFilesFilderPath, `.env.${envName}`),
    join(envFilesFilderPath, '.env.production'),
  ],
  isGlobal: true,
});
