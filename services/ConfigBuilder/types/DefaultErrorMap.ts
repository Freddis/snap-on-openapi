import {ErrorCode} from '../../../enums/ErrorCode';
import {ErrorConfigMap} from '../../../types/config/ErrorConfigMap';
import {unknownErrorResponseValidator} from '../../../types/errors/responses/UnknownErrorResponse';
import {validationErrorResponseValidator} from '../../../types/errors/responses/ValidationErrorResponse';
import {notFoundErrorResponseValidator} from '../../../types/errors/responses/NotFoundErrorResponse';

export class DefaultErrorMap implements ErrorConfigMap<ErrorCode> {
  [ErrorCode.UnknownError] = {
    status: '500',
    description: 'Unknown Error',
    responseValidator: unknownErrorResponseValidator,
  } as const;
  [ErrorCode.ValidationFailed] = {
    status: '400',
    description: 'Validation Failed',
    responseValidator: validationErrorResponseValidator,
  }as const;
  [ErrorCode.NotFound] = {
    status: '404',
    description: 'Route Not Found',
    responseValidator: notFoundErrorResponseValidator,
  }as const;
}
