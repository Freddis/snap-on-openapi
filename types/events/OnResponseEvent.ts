import {RouteExtraPropsMap} from '../config/RouteExtraPropsMap';
import {RouteResponse} from '../RouteResponse';
import {OnHandlerEvent} from './OnHandlerEvent';
export interface OnResponseEvent<
  TRouteType extends string,
  TContextMap extends RouteExtraPropsMap<TRouteType>
> extends OnHandlerEvent<TRouteType, TContextMap> {
  response: RouteResponse
}


