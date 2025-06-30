import {OpenApi} from '../../OpenApi';
import {Config} from '../../types/config/Config';
import {RoutePath} from '../../types/RoutePath';
import {DevelopmentUtils} from '../DevelopmentUtils/DevelopmentUtils';

export class TanstackStartWrapper<
 TRouteTypes extends string,
  TErrorCodes extends string,
  TConfig extends Config<TRouteTypes, TErrorCodes>
> {
  protected service: OpenApi<TRouteTypes, TErrorCodes, TConfig>;
  protected developmentUtils: DevelopmentUtils;

  constructor(openApi: OpenApi<TRouteTypes, TErrorCodes, TConfig>) {
    this.service = openApi;
    this.developmentUtils = new DevelopmentUtils();
  }


  createShemaMethods() {
    const processor = async () => {
      const body = this.service.schemaGenerator.getYaml();
      const res = new Response(body, {
        headers: {
          'Content-Type': 'text/html',
        },
      });
      return res;
    };
    return {
      GET: processor,
    };
  }

  createStoplightMethods(schemaRoutePath: RoutePath) {
    const processor = async () => {
      const body = this.developmentUtils.getStoplightHtml(schemaRoutePath);
      const res = new Response(body, {
        headers: {
          'Content-Type': 'text/html',
        },
      });
      return res;
    };
    return {
      GET: processor,
    };
  }

  createSwaggerMethods(schemaRoutePath: RoutePath) {
    const processor = async () => {
      const body = this.developmentUtils.getSwaggerHTML(schemaRoutePath);
      const res = new Response(body, {
        headers: {
          'Content-Type': 'text/html',
        },
      });
      return res;
    };
    return {
      GET: processor,
    };
  }

  getOpenApiRootMethods() {
    const processor = async (ctx: {request: Request}) => {
      const response = await this.service.processRootRoute(ctx.request);
      const res = new Response(JSON.stringify(response.body), {
        status: response.status ?? 200,
      });
      return res;
    };
    return {
      GET: processor,
      POST: processor,
      PATCH: processor,
      PUT: processor,
      DELETE: processor,
    };
  }
}
