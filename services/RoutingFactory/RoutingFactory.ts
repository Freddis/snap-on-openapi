import {ZodFirstPartySchemaTypes, ZodObject, ZodRawShape} from 'zod';
import {Method} from '../../enums/Methods';
import {Route} from '../../types/Route';
import {AnyConfig} from '../../types/config/AnyConfig';
import {RouteExtraProps} from '../../types/config/RouteExtraProps';

export class RoutingFactory<
 TRouteTypes extends string,
 TErrorCodes extends string,
 TConfig extends AnyConfig<TRouteTypes, TErrorCodes>
> {
  protected map: TConfig;

  constructor(map: TConfig) {
    this.map = map;
  }

  public createRoute<
      TType extends TRouteTypes,
      TMethod extends Method,
      TResponseValidator extends ZodFirstPartySchemaTypes | undefined = undefined,
      TQueryValidator extends ZodObject<ZodRawShape> | undefined = undefined,
      TPathValidator extends ZodObject<ZodRawShape> | undefined = undefined,
      TBodyValidator extends ZodObject<ZodRawShape> | undefined = undefined,
      TResponseHeadersValidator extends ZodObject<ZodRawShape> | undefined = undefined,
    >(
      params: Route<
        TType,
        Awaited<ReturnType<TConfig['routes'][TType]['contextFactory']>>,
        TResponseValidator,
        TPathValidator,
        TQueryValidator,
        TBodyValidator,
        TResponseHeadersValidator,
        TMethod
      > & (RouteExtraProps<TConfig['routes'][TType]['extraProps']>)
    ): Route<
        TType,
        Awaited<ReturnType<TConfig['routes'][TType]['contextFactory']>>,
        TResponseValidator,
        TPathValidator,
        TQueryValidator,
        TBodyValidator,
        TResponseHeadersValidator
      > {

    const result : Route<
      TType,
      Awaited<ReturnType<TConfig['routes'][TType]['contextFactory']>>,
      TResponseValidator,
      TPathValidator,
      TQueryValidator,
      TBodyValidator,
      TResponseHeadersValidator,
      TMethod
    > = {
      ...params,
      method: params.method,
      type: params.type,
      path: params.path,
      description: params.description,
      validators: {
        query: params.validators.query,
        path: params.validators.path,
        response: params.validators.response,
        responseHeaders: params.validators.responseHeaders,
        body: params.validators.body,
      },
      handler: params.handler,
    };
    return result;
  }
}
