import {RouteExtraPropsMap} from '../config/RouteExtraPropsMap';
import {OnRouteEventData} from './OnRouteEventData';

export type OnRouteEvent<
  TRouteType extends string,
  TExtraPropsMap extends RouteExtraPropsMap<TRouteType>,
> = {
  [key in TRouteType]: OnRouteEventData<key, TExtraPropsMap>
}[TRouteType]
