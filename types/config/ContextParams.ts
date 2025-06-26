import {ZodObject, ZodRawShape} from 'zod';
import {AnyRoute} from '../AnyRoute';
import {RouteExtraProps} from './RouteExtraProps';

export type ContextParams<TRouteType extends string, TExtraProps extends ZodObject<ZodRawShape> | undefined> = {
  route: AnyRoute<TRouteType> & RouteExtraProps<TExtraProps>
  request: Request,
  params: {
    body: unknown
    query: unknown
    path: unknown
  }
}
