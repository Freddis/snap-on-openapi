import {ZodFirstPartySchemaTypes, ZodObject, ZodRawShape} from 'zod';
import {OpenApiMethods} from '../../enums/OpenApiMethods';
import {BaseOpenApiRoute} from '../../types/BaseOpenApiRoute';
import {OpenApiConfig} from '../../types/OpenApiConfig';

export class RoutingFactory<
 TRouteTypes extends Record<string, string>,
 TSpec extends OpenApiConfig<TRouteTypes, Record<string, string>>
> {
  protected map: TSpec;

  constructor(map: TSpec) {
    this.map = map;
  }

  public createRoute<
      TRouteType extends TRouteTypes[keyof TRouteTypes],
      TMethod extends OpenApiMethods,
      TResponseValidator extends ZodFirstPartySchemaTypes,
      TQueryValidator extends ZodObject<ZodRawShape> | undefined = undefined,
      TPathValidator extends ZodObject<ZodRawShape> | undefined = undefined,
      TBodyValidator extends ZodObject<ZodRawShape> | undefined = undefined,
    >(
      params: BaseOpenApiRoute<
        TRouteType,
        Awaited<ReturnType<TSpec['routes'][TRouteType]['context']>>,
        TResponseValidator,
        TPathValidator,
        TQueryValidator,
        TBodyValidator,
        TMethod
      >// & TPropsMap[TRouteType]
    ): BaseOpenApiRoute<
        TRouteTypes[keyof TRouteTypes],
        Awaited<ReturnType<TSpec['routes'][TRouteTypes[keyof TRouteTypes]]['context']>>,
        TResponseValidator,
        TPathValidator,
        TQueryValidator,
        TBodyValidator
      > {

    const result : BaseOpenApiRoute<
      TRouteTypes[keyof TRouteTypes],
      Awaited<ReturnType<TSpec['routes'][TRouteTypes[keyof TRouteTypes]]['context']>>,
      TResponseValidator,
      TPathValidator,
      TQueryValidator,
      TBodyValidator,
      TMethod
    > = {
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
