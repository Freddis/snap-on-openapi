import {ZodObject, ZodRawShape} from 'zod';
import {ContextParams} from './ContextParams';
import {RouteResponse} from '../RouteResponse';

export type RouteHandlerWrapper<
  TRouteType extends string,
  TExtraProps extends ZodObject<ZodRawShape> | undefined,
  TContext extends object | undefined
> = (
  handler: () => Promise<RouteResponse>,
  params: ContextParams<TRouteType, TExtraProps>,
  context: TContext
) => Promise<RouteResponse>
