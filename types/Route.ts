import {z, ZodFirstPartySchemaTypes, ZodObject, ZodRawShape} from 'zod';
import {Method} from '../enums/Methods';
import {RoutePath} from './RoutePath';

type BodyHandlerResponse<T extends ZodFirstPartySchemaTypes> = Promise<z.infer<T>>
type FullHandlerRespnse<T extends ZodFirstPartySchemaTypes, THeaders extends ZodObject<ZodRawShape>> = Promise<{
  body: z.infer<T>,
  headers: z.infer<THeaders>
}>
type HandlerResponse<T extends ZodFirstPartySchemaTypes, TH extends ZodObject<ZodRawShape> | undefined> =
TH extends undefined ? BodyHandlerResponse<T> : FullHandlerRespnse<T, Exclude<TH, undefined>>

export interface Route<
  TType extends string,
  TContext extends object,
  TResponseValidator extends ZodFirstPartySchemaTypes,
  TPathValidator extends ZodObject<ZodRawShape> | undefined,
  TQueryValidator extends ZodObject<ZodRawShape> | undefined,
  TBodyValidator extends ZodObject<ZodRawShape> | undefined,
  TResponseHeadersValidator extends ZodObject<ZodRawShape> | undefined,
  TMethod extends Method = Method
> {
  type: TType,
  method: TMethod,
  path: RoutePath,
  description: string,
  validators: {
    query?: TQueryValidator
    path?: TPathValidator
    body?: TMethod extends 'GET' ? never : TBodyValidator
    response: TResponseValidator
    responseHeaders?: TResponseHeadersValidator
  }
  handler: (
    context: {
      params: {
        body: TBodyValidator extends ZodObject<ZodRawShape> ? z.infer<TBodyValidator> : object,
        query: TQueryValidator extends ZodObject<ZodRawShape> ? z.infer<TQueryValidator> : object
        path: TPathValidator extends ZodObject<ZodRawShape> ? z.infer<TPathValidator> : object
    } } & TContext,
  ) => HandlerResponse<TResponseValidator, TResponseHeadersValidator>

}
