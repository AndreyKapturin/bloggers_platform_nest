import { applyDecorators } from '@nestjs/common';
import { IsString } from 'class-validator';
import { Trim } from '../transform/trim.decorator';

export const IsStringWithTrim = () => applyDecorators(IsString(), Trim());
