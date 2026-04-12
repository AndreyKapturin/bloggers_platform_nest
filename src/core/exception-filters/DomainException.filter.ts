import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import {
  DomainException,
  DomainExceptionStatus,
} from '../exceptions/DomainException';
import { ApiErrorResultDto } from '../dto/ApiErrorResult.dto';
import { Response } from 'express';

@Catch(DomainException)
export class DomainHttpExceptionsFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = this.mapToHttpStatus(exception.status);
    const responseBody = this.buildResponseBody(exception);

    response.status(status).json(responseBody);
  }

  private mapToHttpStatus(status: DomainExceptionStatus): number {
    switch (status) {
      case DomainExceptionStatus.InvalidCredentials:
        return HttpStatus.UNAUTHORIZED;
      case DomainExceptionStatus.NotFound:
        return HttpStatus.NOT_FOUND;
      case DomainExceptionStatus.InvalidData:
        return HttpStatus.BAD_REQUEST;
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }

  private buildResponseBody(exception: DomainException): ApiErrorResultDto {
    return new ApiErrorResultDto(exception.extensions);
  }
}
