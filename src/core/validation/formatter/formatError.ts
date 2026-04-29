import { ValidationError } from 'class-validator';
import { FieldErrorDto } from '../../dto/ApiErrorResult.dto';

export const formatError = (
  validetionError: ValidationError,
): FieldErrorDto => {
  let message = '';

  for (const key in validetionError.constraints) {
    message = validetionError.constraints[key];
    break;
  }

  return new FieldErrorDto(message, validetionError.property);
};
