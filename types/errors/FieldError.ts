import {z} from 'zod';

const baseFieldErrorValidator = z.object({
  field: z.string().openapi({description: 'Name of the field'}),
  message: z.string().openapi({description: 'Error message'}),
}).openapi({description: 'Field error'});

export const fieldErrorValidator = baseFieldErrorValidator.extend({
  fieldErrors: z.array(baseFieldErrorValidator).optional(), // todo: think about the best approach to add more levels
});

export type FieldErrorValidator = typeof fieldErrorValidator
export type FieldError = z.TypeOf<FieldErrorValidator>
