
import {ErrorConfigMap} from './ErrorConfigMap';
import {Config} from './Config';
import {RouteConfigMap} from './RouteConfigMap';

export type AnyConfig<
TRouteTypes extends string,
TErrorCodes extends string,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
> = Config<TRouteTypes, TErrorCodes, ErrorConfigMap<TErrorCodes>, any, any, RouteConfigMap<TRouteTypes, TErrorCodes, any, any>
 >
