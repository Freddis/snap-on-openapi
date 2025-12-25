import {ZodObject, ZodRawShape} from 'zod';
import {AnyRoute} from '../AnyRoute';
import {RouteExtraProps} from './RouteExtraProps';
import {Logger} from '../../services/Logger/Logger';

export type ContextParams<
TRouteType extends string,
TExtraProps extends ZodObject<ZodRawShape> | undefined
> = {
  route: AnyRoute<TRouteType> & RouteExtraProps<TExtraProps>
  request: Request,
  logger: Logger,
  params: {
    body: unknown
    query: unknown
    path: unknown
  }
}
