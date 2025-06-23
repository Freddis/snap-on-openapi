import {OpenApiErrorConfigMap} from './OpenApiErrorConfigMap';
import {OpenApiErrorResponse} from './OpenApiErrorResponse';
import {OpenApiNarrowConfig} from './OpenApiNarrowConfig';
import {RouteConfigMap} from './RouteConfigMap';

export type OpenApiConfig<
TRouteTypes extends Record<string, string>,
TErrorCodes extends Record<string, string>
> = OpenApiNarrowConfig<
  TRouteTypes,
  TErrorCodes,
  RouteConfigMap<TRouteTypes[keyof TRouteTypes], TErrorCodes[keyof TErrorCodes] >,
  OpenApiErrorConfigMap<TErrorCodes[keyof TErrorCodes]>
 >
