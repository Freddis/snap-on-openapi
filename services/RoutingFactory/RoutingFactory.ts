import {ZodFirstPartySchemaTypes, ZodObject, ZodRawShape} from 'zod';
import {Method} from '../../enums/Methods';
import {Route} from '../../types/Route';
import {AnyConfig} from '../../types/config/AnyConfig';
import {RouteExtraProps} from '../../types/config/RouteExtraProps';
import {StandardRoute} from './types/StandardRoute';

export class RoutingFactory<
 TRouteTypes extends string,
 TErrorCodes extends string,
 TConfig extends AnyConfig<TRouteTypes, TErrorCodes>
> {
  protected map: TConfig;

  constructor(map: TConfig) {
    this.map = map;
  }

  public createCustomRoute<
      TType extends TRouteTypes,
      TMethod extends Method,
      TResponseValidator extends ZodFirstPartySchemaTypes | undefined = undefined,
      TQueryValidator extends ZodObject<ZodRawShape> | undefined = undefined,
      TPathValidator extends ZodObject<ZodRawShape> | undefined = undefined,
      TBodyValidator extends ZodFirstPartySchemaTypes | undefined = undefined,
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

  public createRoute<
      TType extends TRouteTypes,
      TMethod extends Method,
      TResponseValidator extends ZodFirstPartySchemaTypes | undefined = undefined,
      TQueryValidator extends ZodObject<ZodRawShape> | undefined = undefined,
      TPathValidator extends ZodObject<ZodRawShape> | undefined = undefined,
      TBodyValidator extends ZodFirstPartySchemaTypes | undefined = undefined,
      TResponseHeadersValidator extends ZodObject<ZodRawShape> | undefined = undefined,
    >(
      params: StandardRoute<
        TType,
        Awaited<ReturnType<TConfig['routes'][TType]['contextFactory']>>,
        TResponseValidator,
        TPathValidator,
        TQueryValidator,
        TBodyValidator,
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
    const newHandler = async (ctx:unknown) => {
      const body = await params.handler(ctx);
      return {
        body: body,
        status: 200,
        headers: {},
      };
    };
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
        body: params.validators.body,
      },
      handler: newHandler,
    };
    return result;
  }

}
