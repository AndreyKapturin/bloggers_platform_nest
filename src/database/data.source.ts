import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { join, resolve } from 'path';
import { loadPgEnv } from './pg-env.validator';

const NODE_ENV = process.env.NODE_ENV;

if (!NODE_ENV)
  throw new Error(
    'Environment variable "NODE_ENV" is requeired. (production|staging|development|testing)',
  );

const envFilesFolderPath = resolve(__dirname, '..', 'modules', 'config', 'env');
config({ path: join(envFilesFolderPath, `.env.${NODE_ENV}.local`) });
config({ path: join(envFilesFolderPath, `.env.${NODE_ENV}`) });
config({ path: join(envFilesFolderPath, '.env.production') }); 

const pgConfig = loadPgEnv();
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: pgConfig.host,
  port: pgConfig.port,
  database: pgConfig.database,
  username: pgConfig.user,
  password: pgConfig.password,

  entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],

  synchronize: false,
  migrationsRun: false,

  logging: NODE_ENV === 'development' ? 'all' : ['error'],
});
