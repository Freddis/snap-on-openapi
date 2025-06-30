import {TypeOf, ZodObject, ZodRawShape, ZodType} from 'zod';
import {ContextParams} from './ContextParams';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ZodTypeOrNothing<T extends ZodType<any, any, any> | undefined> = T extends ZodType<any, any, any> ? TypeOf<T> : undefined
export type RouteConfig<
  TRouteType extends string,
  TErrorCodes extends string,
  TExtraProps extends ZodObject<ZodRawShape> | undefined,
  TContext extends ZodObject<ZodRawShape> | undefined,
 > = {
  authorization: boolean,
  extraProps: TExtraProps,
  context: TContext,
  contextFactory: (params: ContextParams<TRouteType, TExtraProps>) => Promise<ZodTypeOrNothing<TContext>>,
  errors?: {
    [key in TErrorCodes]?: true;
  }
}
