import {z, ZodFirstPartySchemaTypes, ZodObject, ZodRawShape} from 'zod';
import {Method} from '../enums/Methods';
import {RoutePath} from './RoutePath';

type BodyHandlerResponse<
  T extends ZodFirstPartySchemaTypes | undefined = undefined
> = Promise<T extends undefined ? undefined : z.infer<Exclude<T, undefined>>>

type FullHandlerRespnse<T extends ZodFirstPartySchemaTypes | undefined, THeaders extends ZodObject<ZodRawShape> | undefined> = Promise<{
  body: Awaited<BodyHandlerResponse<T>>
  headers: z.infer<Exclude<THeaders, undefined>>
}>
type HandlerResponse<T extends ZodFirstPartySchemaTypes | undefined, TH extends ZodObject<ZodRawShape> | undefined> =
TH extends undefined ? BodyHandlerResponse<T> : FullHandlerRespnse<T, Exclude<TH, undefined>>

export interface Route<
  TType extends string,
  TContext extends object,
  TResponseValidator extends ZodFirstPartySchemaTypes | undefined,
  TPathValidator extends ZodObject<ZodRawShape> | undefined,
  TQueryValidator extends ZodObject<ZodRawShape> | undefined,
  TBodyValidator extends ZodFirstPartySchemaTypes | undefined,
  TResponseHeadersValidator extends ZodObject<ZodRawShape> | undefined,
  TMethod extends Method = Method
> {
  tags?: string[];
  operationId?: string;
  type: TType,
  method: TMethod,
  path: RoutePath,
  description: string,
  validators: {
    query?: TQueryValidator
    path?: TPathValidator
    body?: TMethod extends 'GET' ? never : TBodyValidator
    response?: TResponseValidator
    responseHeaders?: TResponseHeadersValidator
  }
  handler: (
    context: {
      params: {
        body: TBodyValidator extends ZodFirstPartySchemaTypes ? z.infer<TBodyValidator> : object,
        query: TQueryValidator extends ZodObject<ZodRawShape> ? z.infer<TQueryValidator> : object
        path: TPathValidator extends ZodObject<ZodRawShape> ? z.infer<TPathValidator> : object
    } } & TContext,
  ) => HandlerResponse<TResponseValidator, TResponseHeadersValidator>

}
