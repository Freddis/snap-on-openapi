import {ZodObject, ZodRawShape} from 'zod';
import {RouteConfig} from './RouteConfig';
import {RouteExtraPropsMap} from './RouteExtraPropsMap';
import {RouteContextMap} from './RouteContextMap';

export type RouteConfigMap<
TRouteTypes extends string,
TErrorCodes extends string,
TParamsMap extends RouteExtraPropsMap<TRouteTypes, ZodObject<ZodRawShape> | undefined> | undefined = undefined,
TContextMap extends RouteContextMap<TRouteTypes, TParamsMap> | undefined = undefined
> = {
  [key in TRouteTypes]: RouteConfig<
    key,
    TErrorCodes,
    TParamsMap extends undefined ? undefined: Exclude<TParamsMap, undefined>[key],
    TContextMap extends undefined ? undefined: Awaited<ReturnType<Exclude<TContextMap, undefined>[key]>>
  >
}
