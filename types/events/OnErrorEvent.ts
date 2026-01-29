import {Logger} from '../../services/Logger/Logger';
import {RouteExtraPropsMap} from '../config/RouteExtraPropsMap';
import {OnResponseEvent} from './OnResponseEvent';

export interface OnErrorEvent<
  TRouteType extends string,
  TContextMap extends RouteExtraPropsMap<TRouteType>
> extends Partial<OnResponseEvent<TRouteType, TContextMap>> {
  request: Request;
  logger: Logger;
  error: unknown;
}
