import { ConfigModule } from '@nestjs/config';
import { join } from 'path';

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

const envFilesFolderPath = process.cwd();

export const configModule = ConfigModule.forRoot({
  envFilePath: [
    join(envFilesFolderPath, `.env.${envName}.local`),
    join(envFilesFolderPath, `.env.${envName}`),
    join(envFilesFolderPath, '.env.production'),
  ],
  isGlobal: true,
});
