import {z, ZodFirstPartySchemaTypes, ZodObject, ZodRawShape} from 'zod';
import {OpenApiMethods} from '../enums/OpenApiMethods';

export interface BaseOpenApiRoute<
  TType extends string,
  TContext extends object,
  TResponseValidator extends ZodFirstPartySchemaTypes,
  TPathValidator extends ZodObject<ZodRawShape> | undefined,
  TQueryValidator extends ZodObject<ZodRawShape> | undefined,
  TBodyValidator extends ZodObject<ZodRawShape> | undefined,
  TMethod extends OpenApiMethods = OpenApiMethods
> {
  type: TType,
  method: TMethod,
  path: string,
  description: string,
  validators: {
    query?: TQueryValidator
    path?: TPathValidator
    body?: TMethod extends 'GET' ? never : TBodyValidator
    response: TResponseValidator
  }
    handler: (
      context: {
        params: {
          body: TBodyValidator extends ZodObject<ZodRawShape> ? z.infer<TBodyValidator> : object,
          query: TQueryValidator extends ZodObject<ZodRawShape> ? z.infer<TQueryValidator> : object
          path: TPathValidator extends ZodObject<ZodRawShape> ? z.infer<TPathValidator> : object
      } } & TContext,
    ) => Promise<z.infer<TResponseValidator>>
}
