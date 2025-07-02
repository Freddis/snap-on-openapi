import {ZodObject, ZodRawShape} from 'zod';
import {ContextParams} from './ContextParams';
import {RouteExtraProps} from './RouteExtraProps';


export type RouteConfig<
  TRouteType extends string,
  TErrorCodes extends string,
  TExtraProps extends ZodObject<ZodRawShape> | undefined = ZodObject<ZodRawShape> | undefined,
  TContext extends ZodObject<ZodRawShape> | undefined = ZodObject<ZodRawShape> | undefined,
 > = {
  authorization: boolean,
  extraProps: TExtraProps,
  context: TContext,
  contextFactory: (params: ContextParams<TRouteType, TExtraProps>) => Promise<RouteExtraProps<TContext, undefined>>,
  errors?: {
    [key in TErrorCodes]?: true;
  }
}
