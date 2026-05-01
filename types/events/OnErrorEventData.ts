import {ILogger} from '../../services/Logger/types/ILogger';
import {RouteContextMap} from '../config/RouteContextMap';
import {RouteExtraPropsMap} from '../config/RouteExtraPropsMap';
import {OnResponseEventData} from './OnResponseEventData';

export interface OnErrorEventData<
  TRouteType extends string,
  TExtraPropsMap extends RouteExtraPropsMap<TRouteType>,
  TContext extends RouteContextMap<TRouteType, TExtraPropsMap>
> extends Partial<OnResponseEventData<TRouteType, TExtraPropsMap, TContext>> {
  request: Request;
  logger: ILogger;
  error: unknown;
}
