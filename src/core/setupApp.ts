import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DomainHttpExceptionsFilter } from './exception-filters/DomainException.filter';
import {
  DomainException,
  DomainExceptionStatus,
} from './exceptions/DomainException';
import { FieldErrorDto } from './dto/ApiErrorResult.dto';
import { ValidationError } from 'class-validator';
import cookieParser from 'cookie-parser';

const _formatError = (validetionError: ValidationError): FieldErrorDto => {
  let message = '';

  for (const key in validetionError.constraints) {
    message = validetionError.constraints[key];
    break;
  }

  return new FieldErrorDto(message, validetionError.property);
};

export function setupApp(app: INestApplication) {
  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        const formattedErrors = errors.map(_formatError);
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
