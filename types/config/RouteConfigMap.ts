import {RouteConfig} from './RouteConfig';
import {RouteValidatorMap} from './RouteValidatorMap';

export type RouteConfigMap<
TRouteTypes extends string,
TErrorCodes extends string,
TParamsMap extends RouteValidatorMap<TRouteTypes> | undefined = undefined,
TContextMap extends RouteValidatorMap<TRouteTypes> | undefined = undefined
> = {
  [key in TRouteTypes]: RouteConfig<
    key,
    TErrorCodes,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TParamsMap extends undefined ? any: Exclude<TParamsMap, undefined>[key],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TContextMap extends undefined ? any : Exclude<TContextMap, undefined>[key]
  >
}
