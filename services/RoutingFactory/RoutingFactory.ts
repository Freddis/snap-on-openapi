import {ZodFirstPartySchemaTypes, ZodObject, ZodRawShape} from 'zod';
import {Methods} from '../../enums/Methods';
import {Route} from '../../types/Route';
import {AnyConfig} from '../../types/config/AnyConfig';
import {RouteExtraProps} from '../../types/config/RouteExtraProps';

type SafeMerge<T> = T extends undefined ? object : T;
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
      TMethod extends Methods,
      TResponseValidator extends ZodFirstPartySchemaTypes,
      TQueryValidator extends ZodObject<ZodRawShape> | undefined = undefined,
      TPathValidator extends ZodObject<ZodRawShape> | undefined = undefined,
      TBodyValidator extends ZodObject<ZodRawShape> | undefined = undefined,
    >(
      params: Route<
        TType,
        Awaited<ReturnType<TConfig['routes'][TType]['context']>>,
        TResponseValidator,
        TPathValidator,
        TQueryValidator,
        TBodyValidator,
        TMethod
      > & (SafeMerge<RouteExtraProps<TConfig['routes'][TType]['extraProps']>>)
    ): Route<
        TType,
        Awaited<ReturnType<TConfig['routes'][TType]['context']>>,
        TResponseValidator,
        TPathValidator,
        TQueryValidator,
        TBodyValidator
      > {

    const result : Route<
      TType,
      Awaited<ReturnType<TConfig['routes'][TType]['context']>>,
      TResponseValidator,
      TPathValidator,
      TQueryValidator,
      TBodyValidator,
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
      handler: params.handler,
    };
    return result;
  }
}
