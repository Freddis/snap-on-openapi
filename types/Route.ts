import {z, ZodTypeAny, ZodObject, ZodRawShape} from 'zod';
import {Method} from '../enums/Methods';
import {RoutePath} from './RoutePath';
import {RouteResponse} from './RouteResponse';
export interface Route<
  TType extends string,
  TContext extends object,
  TResponseValidator extends ZodTypeAny | undefined,
  TPathValidator extends ZodObject<ZodRawShape> | undefined,
  TQueryValidator extends ZodObject<ZodRawShape> | undefined,
  TBodyValidator extends ZodTypeAny | undefined,
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
        body: TBodyValidator extends ZodTypeAny ? z.infer<TBodyValidator> : object,
        query: TQueryValidator extends ZodObject<ZodRawShape> ? z.infer<TQueryValidator> : object
        path: TPathValidator extends ZodObject<ZodRawShape> ? z.infer<TPathValidator> : object
    } } & TContext,
  ) => Promise<RouteResponse>
}
