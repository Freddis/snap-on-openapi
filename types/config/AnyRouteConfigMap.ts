import {RouteConfig} from './RouteConfig';

export type AnyRouteConfigMap<
TRouteTypes extends string,
TErrorCodes extends string,
> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key in TRouteTypes]: RouteConfig<key, TErrorCodes, any, any>
}
