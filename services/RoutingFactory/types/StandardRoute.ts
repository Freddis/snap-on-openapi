import {z, ZodFirstPartySchemaTypes, ZodObject, ZodRawShape} from 'zod';
import {Method} from '../../../enums/Methods';
import {RoutePath} from '../../../types/RoutePath';

type BodyHandlerResponse<
  T extends ZodFirstPartySchemaTypes | undefined = undefined
> = Promise<T extends undefined ? void : z.infer<Exclude<T, undefined>>>

export interface StandardRoute<
  TType extends string,
  TContext extends object,
  TResponseValidator extends ZodFirstPartySchemaTypes | undefined,
  TPathValidator extends ZodObject<ZodRawShape> | undefined,
  TQueryValidator extends ZodObject<ZodRawShape> | undefined,
  TBodyValidator extends ZodFirstPartySchemaTypes | undefined,
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
  }
  handler: (
    context: {
      params: {
        body: TBodyValidator extends ZodFirstPartySchemaTypes ? z.infer<TBodyValidator> : object,
        query: TQueryValidator extends ZodObject<ZodRawShape> ? z.infer<TQueryValidator> : object
        path: TPathValidator extends ZodObject<ZodRawShape> ? z.infer<TPathValidator> : object
    } } & TContext,
  ) => BodyHandlerResponse<TResponseValidator>

}
