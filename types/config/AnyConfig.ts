
import {ErrorConfigMap} from './ErrorConfigMap';
import {Config} from './Config';
import {RouteConfigMap} from './RouteConfigMap';

export type AnyConfig<
TRouteTypes extends string,
TErrorCodes extends string,
> = Config<
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
