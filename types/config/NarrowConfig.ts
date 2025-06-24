import {ErrorConfigMap} from './ErrorConfigMap';
import {ErrorResponse} from './ErrorResponse';
import {RouteConfigMap} from './RouteConfigMap';

export type NarrowConfig<
TRouteTypes extends Record<string, string>,
TErrorCodes extends Record<string, string>,
TRouteConfigMap extends RouteConfigMap<TRouteTypes[keyof TRouteTypes], TErrorCodes[keyof TErrorCodes]>,
TErrorConfigMap extends ErrorConfigMap<TErrorCodes[keyof TErrorCodes]>
>
 = {
  routes: TRouteConfigMap
  errors: TErrorConfigMap
  handleError: (e: unknown) => {
    code: TErrorCodes[keyof TErrorCodes],
    body: ErrorResponse<ErrorConfigMap<TErrorCodes[keyof TErrorCodes]>>
  }
  defaultErrorResponse: object
  skipDescriptionsCheck?: boolean;
}
