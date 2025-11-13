
import {ExpressHandler} from './types/ExpressHandler';
import {ExpressApp} from './types/ExpressApp';
import {ExpressRequest} from './types/ExpressRequest';
import {DevelopmentUtils} from '../DevelopmentUtils/DevelopmentUtils';
import {OpenApi} from '../../OpenApi';
import {AnyConfig} from '../../types/config/AnyConfig';
import {RoutePath} from '../../types/RoutePath';
import {format, parse} from 'url';

export class ExpressWrapper<
 TRouteTypes extends string,
 TErrorCodes extends string,
 TConfig extends AnyConfig<TRouteTypes, TErrorCodes>
> {
  protected service: OpenApi<TRouteTypes, TErrorCodes, TConfig>;
  protected developmentUtils: DevelopmentUtils;
  protected schemaRoute: RoutePath = '/openapi-schema';

  constructor(openApi: OpenApi<TRouteTypes, TErrorCodes, TConfig>) {
    this.service = openApi;
    this.developmentUtils = new DevelopmentUtils();
  }

  public createStoplightRoute(route: RoutePath, expressApp: ExpressApp): void {
    const handler: ExpressHandler = async (req, res) => {
      const body = this.developmentUtils.getStoplightHtml(this.schemaRoute);
      res.status(200).header('Content-Type', 'text/html').send(body);
    };
    this.createSchemaRoute(this.schemaRoute, expressApp);
    expressApp.get(route, handler);
  }

  public createSwaggerRoute(route: RoutePath, expressApp: ExpressApp): void {
    const handler: ExpressHandler = async (req, res) => {
      const body = this.developmentUtils.getSwaggerHTML(this.schemaRoute);
      res.status(200).header('Content-Type', 'text/html').send(body);
    };
    this.createSchemaRoute(this.schemaRoute, expressApp);
    expressApp.get(route, handler);
  }

  public createSchemaRoute(route: RoutePath, expressApp: ExpressApp): void {
    const handler: ExpressHandler = async (req, res) => {
      const body = this.service.schemaGenerator.getYaml();
      res.status(200).header('Content-Type', 'text/html').send(body);
    };
    expressApp.get(route, handler);
  }

  public createOpenApiRootRoute(expressApp: ExpressApp): void {
    const route = this.service.getBasePath();
    const handler: ExpressHandler = async (req, res) => {
      const request = await this.covertExpressRequestToRequest(req);
      const result = await this.service.processRootRoute(request);
      res.status(result.status);
      res.header('Content-Type', 'application/json');
      for (const header of Object.entries(result.headers)) {
        res.header(header[0], header[1]);
      }
      res.json(result.body);
    };
    const regex = new RegExp(`${route}.*`);
    expressApp.get(regex, handler);
    expressApp.post(regex, handler);
    expressApp.patch(regex, handler);
    expressApp.delete(regex, handler);
    expressApp.put(regex, handler);
  }

  protected async covertExpressRequestToRequest(req: ExpressRequest): Promise<Request> {
    const headerToStr = (header: string | string[]) => {
      if (Array.isArray(header)) {
        return header.join(',');
      }
      return header;
    };
    const emptyHeaders: Record<string, string> = {};
    const headers = Object.entries(req.headers).reduce((acc, val) => ({
      ...acc,
      ...(typeof val[1] !== 'undefined' ? {[val[0]]: headerToStr(val[1])} : {}),
    }), emptyHeaders);
    const body = await this.requestBodyToString(req);
    const parsedUrl = parse(req.originalUrl, true);
    const url = format({
      ...parsedUrl,
      host: req.host,
      protocol: req.protocol,
    });
    const openApiRequest = new Request(url, {
      headers: headers,
      method: req.method,
      body: body,
    });
    return openApiRequest;
  }

  protected async requestBodyToString(req: ExpressRequest): Promise<string | undefined> {
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      return undefined;
    }

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];

      req.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });

      req.on('end', () => {
        const bodyBuffer = Buffer.concat(chunks);
        const bodyString = bodyBuffer.toString();
        resolve(bodyString);
      });

      req.on('error', (error: Error) => {
        reject(error);
      });
    });
  }
}
