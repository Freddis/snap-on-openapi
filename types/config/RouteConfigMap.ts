import {RouteConfig} from './RouteConfig';

export type RouteConfigMap<TRouteTypes extends string, TErrorCode extends string, > = {
  [key in TRouteTypes]: RouteConfig<key, TErrorCode>
}
