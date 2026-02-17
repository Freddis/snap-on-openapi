import {ZodOpenApiVersion} from 'zod-openapi';
import {LogLevel} from '../../services/Logger/types/LogLevel';
import {RoutePath} from '../RoutePath';
import {ErrorConfigMap} from './ErrorConfigMap';
import {ErrorResponse} from './ErrorResponse';
import {RouteConfigMap} from './RouteConfigMap';
import {RouteContextMap} from './RouteContextMap';
import {RouteExtraPropsMap} from './RouteExtraPropsMap';
import {Server} from './Server';
import {OnErrorEvent} from '../events/OnErrorEvent';
import {OnHandlerEvent} from '../events/OnHandlerEvent';
import {OnRequestEvent} from '../events/OnRequestEvent';
import {OnResponseEvent} from '../events/OnResponseEvent';
import {OnRouteEvent} from '../events/OnRouteEvent';
import {ILogger} from '../../services/Logger/types/ILogger';

export type Config<
  TRouteTypes extends string,
  TErrorCodes extends string,
  TErrorConfigMap extends ErrorConfigMap<TErrorCodes>,
  TRouteParamMap extends RouteExtraPropsMap<TRouteTypes>,
  TRouteContextMap extends RouteContextMap<TRouteTypes, TRouteParamMap>,
  TRouteConfigMap extends RouteConfigMap<TRouteTypes, TErrorCodes, TRouteParamMap, TRouteContextMap>,
>
 = {
  disableResponseValidation?: boolean;
  logger?: ILogger;
  basePath: RoutePath
  routes: TRouteConfigMap
  generator?: {
    openApiVersion?: ZodOpenApiVersion
    goodResponseDescription?: string,
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
  onRequest?: (e: OnRequestEvent) => Promise<void>;
  onRoute?: (
    e: OnRouteEvent<TRouteTypes, TRouteParamMap>
  ) => Promise<void>;
  onHandler?: (e: OnHandlerEvent<TRouteTypes, TRouteParamMap, Awaited<ReturnType<TRouteContextMap[TRouteTypes]>>>) => Promise<void>;
  onResponse?: (e: OnResponseEvent<TRouteTypes, TRouteParamMap, Awaited<ReturnType<TRouteContextMap[TRouteTypes]>>>) => Promise<void>;
  onError?: (
    e: OnErrorEvent<TRouteTypes, TRouteParamMap, Awaited<ReturnType<TRouteContextMap[TRouteTypes]>>>
  ) => Promise<ErrorResponse<TErrorCodes, TErrorConfigMap>>
}
