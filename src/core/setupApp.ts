import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DomainHttpExceptionsFilter } from './exception-filters/DomainException.filter';
import {
  DomainException,
  DomainExceptionStatus,
} from './exceptions/DomainException';
import cookieParser from 'cookie-parser';
import { formatError } from './validation/formatter/formatError';
import { express as useragent } from 'express-useragent';


export function setupApp(app: INestApplication) {
  app.use(cookieParser());
  app.use(useragent());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      stopAtFirstError: true,
      validateCustomDecorators: true,
      exceptionFactory: (errors) => {
        const formattedErrors = errors.map(formatError);
        throw new DomainException(
          DomainExceptionStatus.InvalidData,
          'Validation error',
          formattedErrors,
        );
      },
    }),
  );

  app.useGlobalFilters(new DomainHttpExceptionsFilter());
}
