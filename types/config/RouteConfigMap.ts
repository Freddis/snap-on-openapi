import {ZodObject, ZodRawShape} from 'zod';
import {RouteConfig} from './RouteConfig';
import {RouteValidatorMap} from './RouteValidatorMap';

export type RouteConfigMap<
TRouteTypes extends string,
TErrorCodes extends string,
TParamsMap extends RouteValidatorMap<TRouteTypes, ZodObject<ZodRawShape> | undefined> | undefined = undefined,
TContextMap extends RouteValidatorMap<TRouteTypes, ZodObject<ZodRawShape> | undefined> | undefined = undefined
> = {
  [key in TRouteTypes]: RouteConfig<
    key,
    TErrorCodes,
    TParamsMap extends undefined ? undefined: Exclude<TParamsMap, undefined>[key],
    TContextMap extends undefined ? undefined : Exclude<TContextMap, undefined>[key]
  >
}
