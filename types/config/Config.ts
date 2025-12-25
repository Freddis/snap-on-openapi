import {ZodOpenApiVersion} from 'zod-openapi';
import {Logger} from '../../services/Logger/Logger';
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
  logger?: Logger;
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
  onRoute?: (e: OnRouteEvent) => Promise<void>;
  onHandler?: (e: OnHandlerEvent) => Promise<void>;
  onResponse?: (e: OnResponseEvent) => Promise<void>;
  onError?: (e: OnErrorEvent) => Promise<ErrorResponse<TErrorCodes, TErrorConfigMap>>
}
