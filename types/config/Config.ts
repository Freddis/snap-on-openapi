import {ErrorConfigMap} from './ErrorConfigMap';
import {NarrowConfig} from './NarrowConfig';
import {RouteConfigMap} from './RouteConfigMap';

export type Config<
TRouteTypes extends Record<string, string>,
TErrorCodes extends Record<string, string>
> = NarrowConfig<
  TRouteTypes,
  TErrorCodes,
  RouteConfigMap<TRouteTypes[keyof TRouteTypes], TErrorCodes[keyof TErrorCodes] >,
  ErrorConfigMap<TErrorCodes[keyof TErrorCodes]>
 >
