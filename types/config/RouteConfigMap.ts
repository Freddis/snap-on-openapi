import {RouteExtraPropsMap} from '../RouteExtraPropsMap';
import {RouteConfig} from './RouteConfig';

export type RouteConfigMap<
TRouteTypes extends string,
TErrorCode extends string,
TExtraPropsMap extends RouteExtraPropsMap<TRouteTypes>
 > = {
  [key in TRouteTypes]: RouteConfig<key, TErrorCode, TExtraPropsMap[key]>
}
