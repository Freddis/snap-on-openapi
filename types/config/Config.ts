import {RouteExtraPropsMap} from '../RouteExtraPropsMap';
import {ErrorConfigMap} from './ErrorConfigMap';
import {NarrowConfig} from './NarrowConfig';
import {RouteConfigMap} from './RouteConfigMap';

export type Config<
TRouteTypes extends Record<string, string>,
TErrorCodes extends Record<string, string>,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
TRoutePropsMap extends RouteExtraPropsMap<TRouteTypes[keyof TRouteTypes]> = any
> = NarrowConfig<
  TRouteTypes,
  TErrorCodes,
  TRoutePropsMap,
  RouteConfigMap<TRouteTypes[keyof TRouteTypes], TErrorCodes[keyof TErrorCodes], TRoutePropsMap>,
  ErrorConfigMap<TErrorCodes[keyof TErrorCodes]>
 >
