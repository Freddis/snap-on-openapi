
import {ErrorConfigMap} from './ErrorConfigMap';
import {NarrowConfig} from './NarrowConfig';
import {RouteConfigMap} from './RouteConfigMap';

export type Config<
TRouteTypes extends string,
TErrorCodes extends string,
> = NarrowConfig<
  TRouteTypes,
  TErrorCodes,
  ErrorConfigMap<TErrorCodes>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  RouteConfigMap<TRouteTypes, TErrorCodes, any, any>
 >
