import {ZodObject, ZodRawShape} from 'zod';
import {AnyRoute} from '../AnyRoute';
import {RouteExtraProps} from './RouteExtraProps';
import {ILogger} from '../../services/Logger/types/ILogger';

export type ContextParams<
TRouteType extends string,
TExtraProps extends ZodObject<ZodRawShape> | undefined
> = {
  route: AnyRoute<TRouteType> & RouteExtraProps<TExtraProps>
  request: Request,
  logger: ILogger,
  params: {
    body: unknown
    query: unknown
    path: unknown
  }
}
