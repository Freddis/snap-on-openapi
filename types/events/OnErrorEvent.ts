import {ILogger} from '../../services/Logger/types/ILogger';
import {RouteExtraPropsMap} from '../config/RouteExtraPropsMap';
import {OnResponseEvent} from './OnResponseEvent';

export interface OnErrorEvent<
  TRouteType extends string,
  TContextMap extends RouteExtraPropsMap<TRouteType>,
  TContext extends object
> extends Partial<OnResponseEvent<TRouteType, TContextMap, TContext>> {
  request: Request;
  logger: ILogger;
  error: unknown;
}
