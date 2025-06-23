import {OpenApiErrorConfigMap} from './OpenApiErrorConfigMap';
import {OpenApiErrorResponse} from './OpenApiErrorResponse';
import {RouteConfigMap} from './RouteConfigMap';

export type OpenApiNarrowConfig<
TRouteTypes extends Record<string, string>,
TErrorCodes extends Record<string, string>,
TRouteConfigMap extends RouteConfigMap<TRouteTypes[keyof TRouteTypes], TErrorCodes[keyof TErrorCodes]>,
TErrorConfigMap extends OpenApiErrorConfigMap<TErrorCodes[keyof TErrorCodes]>
>
 = {
  routes: TRouteConfigMap
  errors: TErrorConfigMap
  handleError?: (e: unknown) => {
    code: TErrorCodes[keyof TErrorCodes],
    body: OpenApiErrorResponse<OpenApiErrorConfigMap<TErrorCodes[keyof TErrorCodes]>>
  }
  defaultErrorResponse: object
}
