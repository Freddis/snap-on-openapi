import {RouteContextMap} from '../config/RouteContextMap';
import {RouteExtraPropsMap} from '../config/RouteExtraPropsMap';
import {OnResponseEventData} from './OnResponseEventData';

export type OnResponseEvent<
  TRouteType extends string,
  TExtraPropsMap extends RouteExtraPropsMap<TRouteType>,
  TContextMap extends RouteContextMap<TRouteType, TExtraPropsMap>
> = {
  [key in TRouteType]: OnResponseEventData<key, TExtraPropsMap, TContextMap>
}[TRouteType]


