import { plainToInstance } from 'class-transformer';
import { IsNotEmpty, IsNumber, validateSync } from 'class-validator';

export class PGEnvValidator {
  @IsNotEmpty({
    message: 'PG_HOST is required. You can use "localhost" for development',
  })
  host!: string;

  @IsNumber({}, { message: 'PG_PORT must be a number. Example: 5432' })
  port!: number;

  @IsNotEmpty({
    message: 'PG_DATABASE is required. Use your database name',
  })
  database!: string;

  @IsNotEmpty({ message: 'PG_USER is required' })
  user!: string;

  @IsNotEmpty({ message: 'PG_PASSWORD is required' })
  password!: string;
}

export function loadPgEnv(): PGEnvValidator {
  const raw = {
    host: process.env.PG_HOST,
    port: process.env.PG_PORT ? Number(process.env.PG_PORT) : undefined,
    database: process.env.PG_DATABASE,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
  };

  const config = plainToInstance(PGEnvValidator, raw);

  const errors = validateSync(config, {
    skipMissingProperties: false,
    whitelist: true,
  });

  if (errors.length > 0) {
    const messages = errors
      .map((err) => Object.values(err.constraints || {}).join(', '))
      .join('; ');
    throw new Error('PG config validation failed: ' + messages);
  }

  return config;
}
