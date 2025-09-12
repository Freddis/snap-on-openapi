import {Logger} from '../../services/Logger/Logger';
import {LogLevel} from '../../services/Logger/types/LogLevel';
import {RoutePath} from '../RoutePath';
import {ErrorConfigMap} from './ErrorConfigMap';
import {ErrorResponse} from './ErrorResponse';
import {RouteConfigMap} from './RouteConfigMap';
import {RouteContextMap} from './RouteContextMap';
import {RouteExtraPropsMap} from './RouteExtraPropsMap';
import {Server} from './Server';

export type Config<
  TRouteTypes extends string,
  TErrorCodes extends string,
  TErrorConfigMap extends ErrorConfigMap<TErrorCodes>,
  TRouteParamMap extends RouteExtraPropsMap<TRouteTypes>,
  TRouteContextMap extends RouteContextMap<TRouteTypes, TRouteParamMap>,
  TRouteConfigMap extends RouteConfigMap<TRouteTypes, TErrorCodes, TRouteParamMap, TRouteContextMap>,
>
 = {
  logger?: Logger;
  basePath: RoutePath
  routes: TRouteConfigMap
  errors: TErrorConfigMap
  defaultError: ErrorResponse<TErrorCodes, TErrorConfigMap>
  skipDescriptionsCheck?: boolean;
  apiName?: string
  servers?: Server[]
  logLevel?: LogLevel
  handleError?: (e: unknown, req: Request) => ErrorResponse<TErrorCodes, TErrorConfigMap>
}
