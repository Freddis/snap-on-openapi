import {OpenApi} from '../../OpenApi';
import {Config} from '../../types/config/Config';
import {DevelopmentUtils} from '../DevelopmentUtils/DevelopmentUtils';
import {TanStackApiRoute} from './types/TanStackAPIRoute';
import {TanstackStartRoutingFunc} from './types/TanstackStartRoutingFunc';

export class TanstackStartWrapper<
 TRouteTypes extends Record<string, string>,
  TErrorCodes extends Record<string, string>,
  TConfig extends Config<TRouteTypes, TErrorCodes>
> {
  protected service: OpenApi<TRouteTypes, TErrorCodes, TConfig>;
  protected developmentUtils: DevelopmentUtils;

  constructor(openApi: OpenApi<TRouteTypes, TErrorCodes, TConfig>) {
    this.service = openApi;
    this.developmentUtils = new DevelopmentUtils();
  }

  createStoplightRoute<T extends string>(schemaRoutePath: string, path: T, router: TanstackStartRoutingFunc<T>): TanStackApiRoute<T> {
    const processor = async () => {
      const body = this.developmentUtils.getStoplightHtml(schemaRoutePath);
      const res = new Response(body, {
        headers: {
          'Content-Type': 'text/html',
        },
      });
      return res;
    };
    return router(path)({
      GET: processor,
    });
  }

  createSwaggerRoute<T extends string>(schemaRoutePath: string, path: T, router: TanstackStartRoutingFunc<T>): TanStackApiRoute<T> {
    const processor = async () => {
      const body = this.developmentUtils.getSwaggerHTML(schemaRoutePath);
      const res = new Response(body, {
        headers: {
          'Content-Type': 'text/html',
        },
      });
      return res;
    };
    return router(path)({
      GET: processor,
    });
  }

  createSchemaRoute<T extends string>(path: T, router: TanstackStartRoutingFunc<T>): TanStackApiRoute<T> {
    const processor = async () => {
      const body = this.service.schemaGenerator.getYaml();
      const res = new Response(body, {
        headers: {
          'Content-Type': 'text/html',
        },
      });
      return res;
    };
    return router(path)({
      GET: processor,
    });
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
