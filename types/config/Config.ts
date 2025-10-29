import {ZodOpenApiVersion} from 'zod-openapi';
import {Logger} from '../../services/Logger/Logger';
import {LogLevel} from '../../services/Logger/types/LogLevel';
import {AnyRoute} from '../AnyRoute';
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
  generator?: {
    openApiVersion?: ZodOpenApiVersion
    generateErrors?: boolean;
    requestMediaTypes?: string[]
    responseMediaTypes?: string[]
  }
  errors: TErrorConfigMap
  defaultError: ErrorResponse<TErrorCodes, TErrorConfigMap>
  skipDescriptionsCheck?: boolean;
  apiName?: string
  apiVersion?: string
  servers?: Server[]
  logLevel?: LogLevel
  handleError?: (e: unknown, req: Request) => ErrorResponse<TErrorCodes, TErrorConfigMap>
  middleware?: <T extends TRouteTypes>(
    route: AnyRoute<T>,
    ctx: Awaited<ReturnType<TRouteContextMap[T]>>
  ) => Promise<{body?: unknown, status?: number, headers?: Record<string, string>}>
}
