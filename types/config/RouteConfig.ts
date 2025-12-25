import {ZodObject, ZodRawShape} from 'zod';
import {ContextParams} from './ContextParams';
import {RouteHandlerWrapper} from './RouteHandlerWrapper';

export type RouteConfig<
  TRouteType extends string,
  TErrorCodes extends string,
  TExtraProps extends ZodObject<ZodRawShape> | undefined = ZodObject<ZodRawShape> | undefined,
  TContext extends object | undefined = object | undefined,
 > = {
  authorization: boolean,
  extraProps: TExtraProps,
  contextFactory: (params: ContextParams<TRouteType, TExtraProps>) => Promise<TContext>,
  handlerWrapper?: RouteHandlerWrapper<TRouteType, TExtraProps, TContext>,
  errors?: {
    [key in TErrorCodes]?: true;
  }
}
