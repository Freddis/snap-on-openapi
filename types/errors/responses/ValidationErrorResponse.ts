import 'zod-openapi/extend';
import {z} from 'zod';
import {ErrorCode} from '../../../enums/ErrorCode';
import {fieldErrorValidator} from '../FieldError';
import {ValidationLocation} from '../../../enums/ValidationLocations';

export const validationErrorResponseValidator = z.object({
  error: z.object({
    code: z.literal(ErrorCode.ValidationFailed).openapi({description: 'Code to handle on the frontend'}),
    fieldErrors: fieldErrorValidator.array(),
    location: z.nativeEnum(ValidationLocation),
  }).openapi({description: 'Error response'}),
});

export type ValidationErrorResponseValidator = typeof validationErrorResponseValidator
export type ValidationErrorResponse = z.TypeOf<ValidationErrorResponseValidator>
