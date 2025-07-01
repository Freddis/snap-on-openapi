import z from 'zod';
import {ErrorCode} from '../../../enums/ErrorCode';
import {ErrorConfigMap} from '../../../types/config/ErrorConfigMap';

export class DefaultErrorMap implements ErrorConfigMap<ErrorCode> {
  [ErrorCode.UnknownError] = {
    status: '500',
    description: 'Unkwown Error',
    responseValidator: z.object({
      error: z.literal(ErrorCode.UnknownError),
    }),
  } as const;
  [ErrorCode.ValidationFailed] = {
    status: '400',
    description: 'Validation Failed',
    responseValidator: z.object({
      error: z.literal(ErrorCode.ValidationFailed),
    }),
  }as const;
  [ErrorCode.NotFound] = {
    status: '404',
    description: 'Route Not Found',
    responseValidator: z.object({
      error: z.literal(ErrorCode.NotFound),
    }),
  }as const;
}
