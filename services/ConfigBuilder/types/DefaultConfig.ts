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
  handleError? = (e: unknown): ErrorResponse<ErrorCode, DefaultErrorMap> => {
    if (e instanceof ValidationError) {
      const zodError = e.getZodError();
      const map: FieldError[] = [];
      for (const issue of zodError.issues) {
        map.push({
          field: issue.path.map((x) => x.toString()).join('.'),
          message: issue.message,
        });
      }
      if (e.getLocation() !== ValidationLocation.Response) {
        const response: ValidationErrorResponse = {
          error: {
            code: ErrorCode.ValidationFailed,
            location: e.getLocation(),
            fieldErrors: map,
          },
        };
        return {code: ErrorCode.ValidationFailed, body: response};
      }
    }

    if (e instanceof BuiltInError && e.getCode() === ErrorCode.NotFound) {
      return {code: ErrorCode.NotFound, body: {error: ErrorCode.NotFound}};
    }

    const unknownError: UnknownErrorResponse = {
      error: ErrorCode.UnknownError,
    };
    return {code: ErrorCode.UnknownError, body: unknownError};
  };
  skipDescriptionsCheck?: boolean = false;
}
