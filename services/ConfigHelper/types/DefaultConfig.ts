import {ErrorCode} from '../../../enums/ErrorCode';
import {SampleRouteType} from '../../../enums/SampleRouteType';
import {NarrowConfig} from '../../../types/config/NarrowConfig';
import {RoutePath} from '../../../types/RoutePath';
import {DefaultErrorMap} from './DefaultErrorMap';
import {DefaultRouteContextMap} from './DefaultRouteContextMap';
import {DefaultRouteMap} from './DefaultRouteMap';
import {DefaultRouteParamsMap} from './DefaultRouteParamsMap';

export class DefaultConfig implements NarrowConfig<
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
  handleError? = () => this.defaultError;
}
