import 'zod-openapi/extend';
import {z} from 'zod';
import {ErrorCode} from '../../../enums/ErrorCode';

export const unknownErrorResponseValidator = z.object({
  error: z.literal(ErrorCode.UnknownError).openapi({description: 'Code to handle on the frontend'}),
}).openapi({description: 'Error response'});

export type UnknownErrorResponseValidator = typeof unknownErrorResponseValidator
export type UnknownErrorResponse = z.TypeOf<UnknownErrorResponseValidator>
