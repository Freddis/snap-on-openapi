import {OpenApi, OpenApiConfig} from 'strap-on-openapi';
import {format} from 'url';
import {ExpressHandler} from './types/ExpressHandler';
import {ExpressApp} from './types/ExpressApp';
import {DevelopmentUtils} from '../DevelopmentUtils/DevelopmentUtils';

export class ExpressWrapper<
 TRouteTypes extends Record<string, string>,
 TErrorCodes extends Record<string, string>,
 TConfig extends OpenApiConfig<TRouteTypes, TErrorCodes>
> {
  protected service: OpenApi<TRouteTypes, TErrorCodes, TConfig>;
  protected developmentUtils: DevelopmentUtils;
  protected schemaRoute = '/openapi-schema';

  constructor(openApi: OpenApi<TRouteTypes, TErrorCodes, TConfig>) {
    this.service = openApi;
    this.developmentUtils = new DevelopmentUtils();
  }
  public createStoplightRoute(route: string, expressApp: ExpressApp): void {
    const handler: ExpressHandler = async (req, res) => {
      const body = this.developmentUtils.getStoplightHtml(this.schemaRoute);
      res.status(200).header('Content-Type', 'text/html').send(body);
    };
    this.createSchemaRoute(this.schemaRoute, expressApp);
    expressApp.get(route, handler);
  }

  public createSwaggerRoute(route: string, expressApp: ExpressApp): void {
    const handler: ExpressHandler = async (req, res) => {
      const body = this.developmentUtils.getSwaggerHTML(this.schemaRoute);
      res.status(200).header('Content-Type', 'text/html').send(body);
    };
    this.createSchemaRoute(this.schemaRoute, expressApp);
    expressApp.get(route, handler);
  }

  public createSchemaRoute(route: string, expressApp: ExpressApp): void {
    const handler: ExpressHandler = async (req, res) => {
      const body = this.service.schemaGenerator.getYaml();
      res.status(200).header('Content-Type', 'text/html').send(body);
    };
    expressApp.get(route, handler);
  }

  public createOpenApiRootRoute(expressApp: ExpressApp): void {
    const route = this.service.getBasePath();
    const handler: ExpressHandler = async (req, res) => {
      const emptyHeaders: Record<string, string> = {};
      const headers = Object.entries(req.headers).reduce((acc, val) => ({
        ...acc,
        ...(typeof val[1] === 'string' ? {[val[0]]: val[1]} : {}),
      }), emptyHeaders);
      const url = format({
        protocol: req.protocol,
        host: req.host,
        pathname: req.originalUrl,
      });
      const openApiRequest = new Request(url, {
        body: req.body,
        headers: headers,
        method: req.method,
      });
      const result = await this.service.processRootRoute(openApiRequest);
      res.status(result.status).header('Content-Type', 'application/json').json(result.body);
    };
    const regex = new RegExp(`${route}.*`);
    expressApp.get(regex, handler);
    expressApp.post(regex, handler);
    expressApp.patch(regex, handler);
    expressApp.delete(regex, handler);
    expressApp.put(regex, handler);
  }
}
