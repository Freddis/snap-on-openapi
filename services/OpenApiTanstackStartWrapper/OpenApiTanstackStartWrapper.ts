import {OpenApi} from '../../OpenApi';
import {OpenApiConfig} from '../../types/OpenApiConfig';
import {TanStackApiRoute} from './types/TanStackAPIRoute';
import {TanstackStartRoutingFunc} from './types/TanstackStartRoutingFunc';

export class OpenApiTanstackStartWrapper<
 TRouteTypes extends Record<string, string>,
  TErrorCodes extends Record<string, string>,
  TSpec extends OpenApiConfig<TRouteTypes, TErrorCodes>
> {
  protected service: OpenApi<TRouteTypes, TErrorCodes, TSpec>;

  constructor(openApi: OpenApi<TRouteTypes, TErrorCodes, TSpec>) {
    this.service = openApi;
  }

  createOpenApiRootRoute<T extends string>(path: T, router: TanstackStartRoutingFunc<T>): TanStackApiRoute<T> {
    const processor = async (ctx: {request: Request}) => {
      const response = await this.service.processRootRoute(path, ctx.request);
      const res = new Response(JSON.stringify(response.body), {
        status: response.status ?? 200,
      });
      return res;
    };

    return router(path)({
      GET: processor,
      POST: processor,
      PATCH: processor,
      PUT: processor,
      DELETE: processor,
    });
  }
}
