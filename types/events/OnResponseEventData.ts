import {RouteContextMap} from '../config/RouteContextMap';
import {RouteExtraPropsMap} from '../config/RouteExtraPropsMap';
import {RouteResponse} from '../RouteResponse';
import {OnHandlerEventData} from './OnHandlerEventData';

export interface OnResponseEventData<
  TRouteType extends string,
  TExtraPropsMap extends RouteExtraPropsMap<TRouteType>,
  TContext extends RouteContextMap<TRouteType, TExtraPropsMap>
> extends OnHandlerEventData<TRouteType, TExtraPropsMap, TContext> {
  response: RouteResponse
}


