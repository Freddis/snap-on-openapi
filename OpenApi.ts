import 'zod-openapi/extend';
import {ErrorCode} from './enums/ErrorCode';
import {ValidationLocation} from './enums/ValidationLocations';
import {ValidationError} from './types/errors/ValidationError';
import {AnyRoute} from './types/AnyRoute';
import {RoutingFactory} from './services/RoutingFactory/RoutingFactory';
import {RouteMap} from './types/RouteMap';
import {SchemaGenerator} from './services/SchemaGenerator/SchemaGenerator';
import {Method} from './enums/Methods';
import {AnyConfig} from './types/config/AnyConfig';
import {BuiltInError} from './types/errors/BuiltInError';
import {Logger} from './services/Logger/Logger';
import {DescriptionChecker} from './services/DescriptionChecker/DescriptionChecker';
import {DevelopmentUtils} from './services/DevelopmentUtils/DevelopmentUtils';
import {ClientGenerator} from './services/ClientGenerator/ClientGenerator';
import {ValidationUtils} from './services/ValidationUtils/ValidationUtils';
import {TanstackStartWrapper} from './services/TanstackStartWrapper/TanstackStartWrapper';
import {Wrappers} from './types/Wrappers';
import {ExpressWrapper} from './services/ExpressWrapper/ExpressWrapper';
import {Server} from './types/config/Server';
import {RoutePath} from './types/RoutePath';
import {Info} from './types/config/Info';
import {SampleRouteType} from './enums/SampleRouteType';
import {ConfigBuilder} from './services/ConfigBuilder/ConfigBuilder';
import {DefaultConfig} from './services/ConfigBuilder/types/DefaultConfig';
import {DefaultErrorMap} from './services/ConfigBuilder/types/DefaultErrorMap';
import {DefaultRouteMap} from './services/ConfigBuilder/types/DefaultRouteMap';
import {InitialBuilder} from './types/InitialBuilder';
import {DefaultRouteContextMap} from './services/ConfigBuilder/types/DefaultRouteContextMap';
import {DefaultRouteParamsMap} from './services/ConfigBuilder/types/DefaultRouteParamsMap';
import z from 'zod';
export class OpenApi<TRouteTypes extends string, TErrorCodes extends string, TConfig extends AnyConfig<TRouteTypes, TErrorCodes>> {
  public static readonly builder: InitialBuilder = OpenApi.getBuilder();
  public readonly validators: ValidationUtils = new ValidationUtils();
  public readonly factory: RoutingFactory<TRouteTypes, TErrorCodes, TConfig>;
  public readonly schemaGenerator: SchemaGenerator<TRouteTypes, TErrorCodes, TConfig>;
  public readonly clientGenerator: ClientGenerator<TRouteTypes, TErrorCodes, TConfig> = new ClientGenerator(this);
  public readonly wrappers: Wrappers<TRouteTypes, TErrorCodes, TConfig>;
  protected routes: AnyRoute<TRouteTypes>[] = [];
  protected logger: Logger;
  protected basePath: RoutePath;
  protected developmentUtils: DevelopmentUtils;
  protected config: TConfig;
  protected descriptionChecker: DescriptionChecker;
  protected servers: Server[] = [];

  protected constructor(config: TConfig) {
    this.config = config;
    this.logger = config.logger ?? new Logger('OpenAPI');
    if (config.logLevel) {
      Logger.logLevel = config.logLevel;
    }
    this.descriptionChecker = new DescriptionChecker({
      checkValidators: !config.skipDescriptionsCheck,
    });
    this.developmentUtils = new DevelopmentUtils();
    this.factory = new RoutingFactory<TRouteTypes, TErrorCodes, TConfig>(config);
    this.basePath = config.basePath;
    const info: Info = {
      title: config.apiName ?? 'My API',
      version: '3.1.0',
    };
    this.schemaGenerator = new SchemaGenerator(this.logger.derrive('SchemaGenerator'), info, this.config, this.routes, this.servers);
    this.wrappers = {
      tanstackStart: new TanstackStartWrapper(this),
      express: new ExpressWrapper(this),
    };
    this.servers.push({
      description: 'Local',
      url: this.basePath,
    });
    const servers = this.config.servers ?? [];
    this.servers.push(...servers);
  }

  public getConfig(): TConfig {
    return this.config;
  }

  public getBasePath(): RoutePath {
    return this.basePath;
  }
  public getServers(): Server[] {
    return this.servers;
  }
  public addRoute(route: AnyRoute<TRouteTypes>) {
    if (!this.config.skipDescriptionsCheck) {
      this.descriptionChecker.checkRoutes([route]);
    }
    this.routes.push(route);
  }
  public addRoutes(pathExtension: RoutePath, routes: AnyRoute<TRouteTypes>[]) {
    const newRoutes = routes.map((x) => ({
      ...x,
      path: this.mergePaths(pathExtension, x.path),
    }));
    if (!this.config.skipDescriptionsCheck) {
      this.descriptionChecker.checkRoutes(newRoutes);
    }
    this.routes.push(...newRoutes);
  }
  public addRouteMap(routeMap: RouteMap<TRouteTypes>) {
    for (const [path, routes] of Object.entries(routeMap)) {
      this.addRoutes(path, routes);
    }
  }
  public mergePaths(...paths: RoutePath[]): RoutePath {
    let final : RoutePath = '/';
    for (const path of paths) {
      if (path === '/') {
        continue;
      }
      if (final === '/') {
        final = path;
        continue;
      }
      final = `${final}${path}` as RoutePath;
    }
    return final;
  }

  public addServer(url: string, description:string,) {
    this.servers.push({description, url});
  }
  protected getRouteForPath(path: string, method: string): AnyRoute<TRouteTypes> | null {
    const fittingRoutes: AnyRoute<TRouteTypes>[] = [];
    outer:
    for (const route of this.routes) {
      if (route.method === method) {
        fittingRoutes.push(route);
        const routeParts = route.path.split('/').filter((x) => x !== '');
        const pathParts = path.split('/').filter((x) => x !== '');
        if (routeParts.length !== pathParts.length) {
          continue;
        }
        for (const [i, chunk] of routeParts.entries()) {
          if (chunk.includes('{')) {
            continue;
          }
          if (chunk !== pathParts[i]) {
            continue outer;
          }
        }
        return route;
      }
    }

    return null;
  }

  async processRootRoute(
    originalReq: Request
  ): Promise<{status: number; body: unknown, headers: Record<string, string>}> {
    try {
      const url = new URL(originalReq.url);
      const urlPath = url.pathname.replace(this.getBasePath(), '');
      const route = this.getRouteForPath(urlPath, originalReq.method);
      if (!route) {
        this.logger.info(`Route for ${originalReq.method}:${urlPath} not found`);
        throw new BuiltInError(ErrorCode.NotFound);
      }
      // obtaining path params
      const pathParams: Record<string, string> = {};
      const routeParts = route.path.split('/');
      const pathParts = urlPath.split('/');
      for (const [i, chunk] of routeParts.entries()) {
        if (chunk.startsWith('{') && chunk.endsWith('}')) {
          const name = chunk.slice(1, chunk.length - 1);
          /* c8 ignore start */
          if (!pathParts[i]) {
            //never
            throw new Error(`Can't find '${name}' param in path`);
          }
          /* c8 ignore stop */
          pathParams[name] = pathParts[i];
          continue;
        }
      }

      let body: unknown = {};
      try {
        body = await originalReq.json();
      } catch {
        //nothing
      }
      const reqQuery: Record<string, string | string[]> = {};
      const queryEntries = url.searchParams.entries();
      for (const [key, val] of queryEntries) {
        if (reqQuery[key] !== undefined) {
          if (Array.isArray(reqQuery[key])) {
            reqQuery[key].push(val);
            continue;
          }
          reqQuery[key] = [reqQuery[key], val];
          continue;
        }
        reqQuery[key] = val;
      }
      const req = {
        path: urlPath,
        method: originalReq.method,
        params: pathParams,
        query: reqQuery,
        body: body,
      };

      this.logger.info(`Calling route ${route.path}`);
      this.logger.info(`${req.method}: ${req.path}`, {
        params: req.params,
        query: req.query,
        body: req.body,
      });
      const queryValidator = route.validators.query?.strict() ?? z.object({});
      const query = queryValidator.safeParse(req.query);
      if (!query.success) {
        throw new ValidationError(query.error, ValidationLocation.Query);
      }
      const pathvalidator = route.validators.path?.strict() ?? z.object({});
      const path = pathvalidator.safeParse(req.params);
      if (!path.success) {
        throw new ValidationError(path.error, ValidationLocation.Path);
      }
      let response: unknown;
      const containsBody = route.method !== Method.GET;
      if (containsBody && route.validators.body) {

        const body = route.validators.body.strict().safeParse(req.body);
        if (!body.success) {
          throw new ValidationError(body.error, ValidationLocation.Body);
        }
        const context = await this.config.routes[route.type].contextFactory({
          route: route,
          request: originalReq,
          params: {
            query: query.data,
            path: path.data,
            body: body.data,
          },
        });
        response = await route.handler({
          ...context,
          params: {
            query: query.data,
            path: path.data,
            body: body.data,
          },
        });
      } else {
        const context = await this.config.routes[route.type].contextFactory({
          route: route,
          request: originalReq,
          params: {
            query: query.data,
            path: path.data,
            body: {},
          },
        });
        response = await route.handler({
          ...context,
          params: {
            query: query.data,
            path: path.data,
            body: {},
          }});
      }

      const finalResponse = route.validators.responseHeaders ? response : {body: response, headers: {}};
      const finalResponseValidator = z.object({
        body: route.validators.response,
        headers: route.validators.responseHeaders?.strict() ?? z.object({}),
      });
      const validated = finalResponseValidator.safeParse(finalResponse);
      if (!validated.success) {
        throw new ValidationError(validated.error, ValidationLocation.Response);
      }
      this.logger.info('Response: 200', validated.data);
      return {status: 200, body: validated.data.body, headers: validated.data.headers};
    } catch (e: unknown) {
      return this.handleError(e, originalReq);
    }
  }

  protected handleError(e: unknown, req: Request) {
    this.logger.error('Error during request openAPI route handling', e);
    try {
      const response = this.config.handleError ? this.config.handleError(e, req) : this.config.defaultError;
      const status = this.config.errors[response.code].status;
      const valid = this.config.errors[response.code].responseValidator.safeParse(response.body);
      if (!valid.success) {
        throw new Error("Error response haven't passed validation");
      }
      this.logger.info(`Response: '${status}'`, response.body);
      return {status: Number(status), body: response.body, headers: {}};
    } catch (e: unknown) {
      this.logger.error('Error during error handling', e);
      const status = this.config.errors[this.config.defaultError.code].status;
      return {status: Number(status), body: this.config.defaultError.body, headers: {}};
    }
  }

  protected static getBuilder() {
    return new ConfigBuilder<
      SampleRouteType,
      ErrorCode,
      DefaultErrorMap,
      DefaultRouteParamsMap,
      DefaultRouteContextMap,
      DefaultRouteMap,
      DefaultConfig
      >((conf) => {
        return new OpenApi(conf);
      });
  }
}
