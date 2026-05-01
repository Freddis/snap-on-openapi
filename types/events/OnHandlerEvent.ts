import {RouteContextMap} from '../config/RouteContextMap';
import {RouteExtraPropsMap} from '../config/RouteExtraPropsMap';
import {OnHandlerEventData} from './OnHandlerEventData';

export type OnHandlerEvent<
TRouteType extends string,
TExtraPropsMap extends RouteExtraPropsMap<TRouteType>,
TContext extends RouteContextMap<TRouteType, TExtraPropsMap>
> = {
  [key in TRouteType]: OnHandlerEventData<key, TExtraPropsMap, TContext>
}[TRouteType]
