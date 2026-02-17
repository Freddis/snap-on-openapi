import {ErrorCode} from '../../../enums/ErrorCode';
import {SampleRouteType} from '../../../enums/SampleRouteType';
import {ValidationLocation} from '../../../enums/ValidationLocations';
import {Config} from '../../../types/config/Config';
import {ErrorResponse} from '../../../types/config/ErrorResponse';
import {BuiltInError} from '../../../types/errors/BuiltInError';
import {FieldError} from '../../../types/errors/FieldError';
import {UnknownErrorResponse} from '../../../types/errors/responses/UnknownErrorResponse';
import {ValidationErrorResponse} from '../../../types/errors/responses/ValidationErrorResponse';
import {ValidationError} from '../../../types/errors/ValidationError';
import {OnErrorEvent} from '../../../types/events/OnErrorEvent';
import {OnResponseEvent} from '../../../types/events/OnResponseEvent';
import {OnRouteEvent} from '../../../types/events/OnRouteEvent';
import {RoutePath} from '../../../types/RoutePath';
import {DefaultErrorMap} from './DefaultErrorMap';
import {DefaultRouteContextMap} from './DefaultRouteContextMap';
import {DefaultRouteMap} from './DefaultRouteMap';
import {DefaultRouteParamsMap} from './DefaultRouteParamsMap';

export class DefaultConfig implements Config<
  SampleRouteType,
  ErrorCode,
  DefaultErrorMap,
  DefaultRouteParamsMap,
  DefaultRouteContextMap,
  DefaultRouteMap
> {
  basePath: RoutePath = '/api';
  routes = new DefaultRouteMap();
  errors = new DefaultErrorMap();
  defaultError = {
    code: ErrorCode.UnknownError,
    body: {
      error: ErrorCode.UnknownError,
    },
  } as const;
  onRequest? = () => Promise.resolve();
  onRoute? = async (e: OnRouteEvent<SampleRouteType, DefaultRouteParamsMap>): Promise<void> => {
    e.logger.info(`Calling route ${e.route.path}`);
    e.logger.info(`${e.method}: ${e.request.url}`, {
      path: e.path,
      query: e.query,
      body: e.body,
    });
  };
  onHandler? = () => Promise.resolve();
  onResponse? = async (e: OnResponseEvent<SampleRouteType, DefaultRouteParamsMap, object>) => {
    e.logger.info(`Response: ${e.response.status}`, {body: e.response.body, headers: e.response.headers});
  };
  onError? = async (
    e: OnErrorEvent<SampleRouteType, DefaultRouteParamsMap, object>
  ): Promise<ErrorResponse<ErrorCode, DefaultErrorMap>> => {
    e.logger.error('Error during request openAPI route handling', {url: e.request.url, error: e.error});
    if (e.error instanceof ValidationError) {
      const zodError = e.error.getZodError();
      const map: FieldError[] = [];
      for (const issue of zodError.issues) {
        map.push({
          field: issue.path.map((x) => x.toString()).join('.'),
          message: issue.message,
        });
      }
      if (e.error.getLocation() !== ValidationLocation.Response) {
        const response: ValidationErrorResponse = {
          error: {
            code: ErrorCode.ValidationFailed,
            location: e.error.getLocation(),
            fieldErrors: map,
          },
        };
        return {code: ErrorCode.ValidationFailed, body: response};
      }
    }

    if (e.error instanceof BuiltInError && e.error.getCode() === ErrorCode.NotFound) {
      return {code: ErrorCode.NotFound, body: {error: ErrorCode.NotFound}};
    }

    const unknownError: UnknownErrorResponse = {
      error: ErrorCode.UnknownError,
    };
    return {code: ErrorCode.UnknownError, body: unknownError};
  };
  skipDescriptionsCheck?: boolean = false;
}
