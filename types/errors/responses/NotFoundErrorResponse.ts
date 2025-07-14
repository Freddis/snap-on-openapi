import 'zod-openapi/extend';
import {z} from 'zod';
import {ErrorCode} from '../../../enums/ErrorCode';

export const notFoundErrorResponseValidator = z.object({
  error: z.literal(ErrorCode.NotFound).openapi({description: 'Code to handle on the frontend'}),
}).openapi({description: 'Error response'});

export type NotFoundErrorResponseValidator = typeof notFoundErrorResponseValidator
export type NotFoundErrorResponse = z.TypeOf<NotFoundErrorResponseValidator>
