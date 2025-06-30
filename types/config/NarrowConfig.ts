import {RoutePath} from '../RoutePath';
import {ErrorConfigMap} from './ErrorConfigMap';
import {ErrorResponse} from './ErrorResponse';
import {RouteConfigMap} from './RouteConfigMap';
import {RouteValidatorMap} from './RouteValidatorMap';
import {Server} from './Server';

export type NarrowConfig<
TRouteTypes extends string,
TErrorCodes extends string,
TErrorConfigMap extends ErrorConfigMap<TErrorCodes>,
TRouteParamMap extends RouteValidatorMap<TRouteTypes>,
TRouteContextMap extends RouteValidatorMap<TRouteTypes>,
TRouteConfigMap extends RouteConfigMap<TRouteTypes, TErrorCodes, TRouteParamMap, TRouteContextMap>,
>
 = {
  basePath: RoutePath
  routes: TRouteConfigMap
  errors: TErrorConfigMap
  defaultError: ErrorResponse<TErrorCodes, TErrorConfigMap>
  skipDescriptionsCheck?: boolean;
  apiName?: string,
  servers?: Server[];
  handleError?: (e: unknown) => ErrorResponse<TErrorCodes, TErrorConfigMap>
}
