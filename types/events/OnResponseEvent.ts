import {RouteExtraPropsMap} from '../config/RouteExtraPropsMap';
import {RouteResponse} from '../RouteResponse';
import {OnHandlerEvent} from './OnHandlerEvent';
export interface OnResponseEvent<
  TRouteType extends string,
  TContextMap extends RouteExtraPropsMap<TRouteType>,
  TContext extends object
> extends OnHandlerEvent<TRouteType, TContextMap, TContext> {
  response: RouteResponse
}


