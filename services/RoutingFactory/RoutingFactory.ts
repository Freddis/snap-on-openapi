import {ZodFirstPartySchemaTypes, ZodObject, ZodRawShape} from 'zod';
import {Methods} from '../../enums/Methods';
import {Route} from '../../types/Route';
import {Config} from '../../types/config/Config';
import {RouteExtraProps} from '../../types/config/RouteExtraProps';

export class RoutingFactory<
 TRouteTypes extends Record<string, string>,
 TConfig extends Config<TRouteTypes, Record<string, string>>
> {
  protected map: TConfig;

  constructor(map: TConfig) {
    this.map = map;
  }

  public createRoute<
      TRouteType extends TRouteTypes[keyof TRouteTypes],
      TMethod extends Methods,
      TResponseValidator extends ZodFirstPartySchemaTypes,
      TQueryValidator extends ZodObject<ZodRawShape> | undefined = undefined,
      TPathValidator extends ZodObject<ZodRawShape> | undefined = undefined,
      TBodyValidator extends ZodObject<ZodRawShape> | undefined = undefined,
    >(
      params: Route<
        TRouteType,
        Awaited<ReturnType<TConfig['routes'][TRouteType]['context']>>,
        TResponseValidator,
        TPathValidator,
        TQueryValidator,
        TBodyValidator,
        TMethod
      > & RouteExtraProps<TConfig['routeParams'][TRouteType]>
    ): Route<
        TRouteTypes[keyof TRouteTypes],
        Awaited<ReturnType<TConfig['routes'][TRouteTypes[keyof TRouteTypes]]['context']>>,
        TResponseValidator,
        TPathValidator,
        TQueryValidator,
        TBodyValidator
      > {

    const result : Route<
      TRouteTypes[keyof TRouteTypes],
      Awaited<ReturnType<TConfig['routes'][TRouteTypes[keyof TRouteTypes]]['context']>>,
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
