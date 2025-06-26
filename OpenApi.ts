import 'zod-openapi/extend';
import {ErrorCode} from './enums/ErrorCode';
import {ValidationLocations} from './enums/ValidationLocations';
import {ValidationError} from './types/errors/ValidationError';
import {AnyRoute} from './types/AnyRoute';
import {RoutingFactory} from './services/RoutingFactory/RoutingFactory';
import {RouteMap} from './types/RouteMap';
import {SchemaGenerator} from './services/SchemaGenerator/SchemaGenerator';
import {Methods} from './enums/Methods';
import {Validator} from './services/Validator/Validator';
import {Config} from './types/config/Config';
import {RouteConfigMap} from './types/config/RouteConfigMap';
import {ErrorConfigMap} from './types/config/ErrorConfigMap';
import {BuiltInError} from './types/errors/BuiltInError';
import {NarrowConfig} from './types/config/NarrowConfig';
import {Logger} from './services/Logger/Logger';
import {DescriptionChecker} from './services/DescriptionChecker/DescriptionChecker';
import {DevelopmentUtils} from './services/DevelopmentUtils/DevelopmentUtils';
import {ClientGenerator} from './services/ClientGenerator/ClientGenerator';
import {ValidationUtils} from './services/ValidationUtils/ValidationUtils';
import {SampleRouteType} from './enums/SampleRouteType';
import z from 'zod';
import {TanstackStartWrapper} from './services/TanstackStartWrapper/TanstackStartWrapper';
import {Wrappers} from './types/Wrappers';
import {ExpressWrapper} from './services/ExpressWrapper/ExpressWrapper';
import {Server} from './types/config/Server';
import {RoutePath} from './types/RoutePath';
import {Info} from './types/config/Info';

export class OpenApi<
  TRouteTypes extends Record<string, string>,
  TErrorCodes extends Record<string, string>,
  TConfig extends Config<TRouteTypes, TErrorCodes>
> {
  public readonly validators: ValidationUtils = new ValidationUtils();
  public readonly factory: RoutingFactory<TRouteTypes, TConfig>;
  public readonly schemaGenerator: SchemaGenerator<TRouteTypes, TConfig>;
  public readonly clientGenerator: ClientGenerator<TRouteTypes, TErrorCodes, TConfig> = new ClientGenerator(this);
  public readonly wrappers: Wrappers<TRouteTypes, TErrorCodes, TConfig>;
  protected routes: AnyRoute<TRouteTypes[keyof TRouteTypes]>[] = [];
  protected logger: Logger;
  protected basePath: RoutePath;
  protected developmentUtils: DevelopmentUtils;
  protected spec: TConfig;
  protected descriptionChecker: DescriptionChecker;
  protected servers: Server[] = [];

  protected constructor(a: TRouteTypes, b: TErrorCodes, spec: TConfig) {
    this.spec = spec;
    this.logger = new Logger('OpenAPI');
    this.descriptionChecker = new DescriptionChecker();
    this.developmentUtils = new DevelopmentUtils();
    this.factory = new RoutingFactory<TRouteTypes, TConfig>(spec);
    this.basePath = spec.basePath;
    const info: Info = {
      title: spec.apiName ?? 'My API',
      version: '3.1.0',
    };
    this.schemaGenerator = new SchemaGenerator(this.logger.getInvoker(), info, this.spec, this.routes, this.servers);
    this.wrappers = {
      tanstackStart: new TanstackStartWrapper(this),
      express: new ExpressWrapper(this),
    };
    this.servers.push({
      description: 'Local',
      url: this.basePath,
    });
    const servers = this.spec.servers ?? [];
    this.servers.push(...servers);
  }

  public getBasePath(): RoutePath {
    return this.basePath;
  }
  public getServers(): Server[] {
    return this.servers;
  }

  public addRoute(pathExtension: RoutePath, routes: AnyRoute<TRouteTypes[keyof TRouteTypes]>[]) {
    const newRoutes = routes.map((x) => ({...x, path: `${pathExtension}${x.path}` as RoutePath}));
    if (!this.spec.skipDescriptionsCheck) {
      this.descriptionChecker.checkRoutes(newRoutes);
    }
    this.routes.push(...newRoutes);
  }

  public addRouteMap(routeMap: RouteMap<TRouteTypes[keyof TRouteTypes]>) {
    for (const [path, routes] of Object.entries(routeMap)) {
      this.addRoute(path, routes);
    }
  }
  public addServer(url: string, description:string,) {
    this.servers.push({description, url});
  }
  protected getRouteForPath(path: string, method: string): AnyRoute<TRouteTypes[keyof TRouteTypes]> | null {
    const fittingRoutes: AnyRoute<TRouteTypes[keyof TRouteTypes]>[] = [];
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
  ): Promise<{status: number; body: unknown}> {
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
          if (!pathParts[i]) {
            //never
            throw new Error(`Can't find '${name}' param in path`);
          }
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
      const req = {
        path: urlPath,
        method: originalReq.method,
        params: pathParams,
        query: Object.fromEntries(url.searchParams.entries()),
        body: body,
      };

      this.logger.info(`Calling route ${route.path}`);
      this.logger.info(`${req.method}: ${req.path}`, {
        params: req.params,
        query: req.query,
        body: req.body,
      });
      const validator = new Validator();
      const query = validator.validateQuery(route.validators.query, req.query);
      if (!query.success) {
        throw new ValidationError(query.error, ValidationLocations.Query);
      }
      const path = validator.validatePath(route.validators.path, req.params);
      if (!path.success) {
        throw new ValidationError(path.error, ValidationLocations.Path);
      }
      let response: unknown;
      const containsBody = route.method !== Methods.GET;
      if (containsBody && route.validators.body) {
        const body = validator.validateBody(route.validators.body, req.body);
        if (!body.success) {
          throw new ValidationError(body.error, ValidationLocations.Body);
        }
        const context = await this.spec.routes[route.type].context({
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
        const context = await this.spec.routes[route.type].context({
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

      const validated = route.validators.response.safeParse(response);
      if (!validated.success) {
        throw new ValidationError(validated.error, ValidationLocations.Response);
      }
      this.logger.info('Response: 200', validated.data);
      return {status: 200, body: validated.data};
    } catch (e: unknown) {
      const response = this.spec.handleError(e);
      const status = this.spec.errors[response.code].status;
      const valid = this.spec.errors[response.code].validator.safeParse(response.body);
      if (!valid.success) {
        return {status: 500, body: this.spec.defaultErrorResponse};
      }
      this.logger.info(`Response: '${status}'`, response.body);
      this.logger.error('Error during request openAPI route handling', e);
      return {status: Number(status), body: response.body};
    }
  }

  public static create(): OpenApi<
    typeof SampleRouteType,
    typeof ErrorCode,
    Config<typeof SampleRouteType, typeof ErrorCode>
  >;

  public static create<TRouteTypes extends Record<string, string>, TErrorCodes extends Record<string, string>, >(
    routeEnum: TRouteTypes,
    errorEnum: TErrorCodes,
  ): OpenApi<TRouteTypes, TErrorCodes, Config<TRouteTypes, TErrorCodes>>

  public static create<
    TRouteTypes extends Record<string, string>,
    TErrorCodes extends Record<string, string>,
    TRouteConfigMap extends RouteConfigMap<TRouteTypes[keyof TRouteTypes], TErrorCodes[keyof TErrorCodes]>,
    TErrorMap extends ErrorConfigMap<TErrorCodes[keyof TErrorCodes]>,
    TConfig extends NarrowConfig<TRouteTypes, TErrorCodes, TRouteConfigMap, TErrorMap>
  >(
    routeEnum: TRouteTypes,
    errorEnum: TErrorCodes,
    errors: TErrorMap,
    routes: TRouteConfigMap,
    spec: Omit<TConfig, 'errors'|'routes'>
  ): OpenApi<TRouteTypes, TErrorCodes, TConfig>

  public static create<
    TRouteTypes extends Record<string, string>,
    TErrorCodes extends Record<string, string>,
    TRouteConfigMap extends RouteConfigMap<TRouteTypes[keyof TRouteTypes], TErrorCodes[keyof TErrorCodes]>,
    TErrorMap extends ErrorConfigMap<TErrorCodes[keyof TErrorCodes]>,
    TConfig extends NarrowConfig<TRouteTypes, TErrorCodes, TRouteConfigMap, TErrorMap>
  >(
    routeEnum?: TRouteTypes,
    errorEnum?: TErrorCodes,
    errors?: TErrorMap,
    routes?: TRouteConfigMap,
    spec?: Omit<TConfig, 'errors'|'routes'>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): OpenApi<any, any, any> {
    const defaultErrors: ErrorConfigMap<ErrorCode> = {
      [ErrorCode.UnknownError]: {
        status: '500',
        description: 'Unknown Api Error',
        validator: z.object({
          error: z.literal(ErrorCode.UnknownError),
        }),
      },
      [ErrorCode.ValidationFailed]: {
        status: '422',
        description: '',
        validator: z.object({
          error: z.literal(ErrorCode.ValidationFailed),
        }),
      },
      [ErrorCode.NotFound]: {
        status: '404',
        description: 'Route Not Found',
        validator: z.object({
          error: z.literal(ErrorCode.NotFound),
        }),
      },
    };
    type DefaultConf = NarrowConfig<
      typeof SampleRouteType,
      typeof ErrorCode,
      RouteConfigMap<SampleRouteType, ErrorCode>,
      ErrorConfigMap<ErrorCode>
    >
    const defaultConf: Omit<DefaultConf, 'errors'| 'routes'> = {
      handleError: () => {
        return {code: ErrorCode.UnknownError, body: {error: ErrorCode.UnknownError}};
      },
      defaultErrorResponse: {
        error: ErrorCode.UnknownError,
      },
      basePath: '/api',
    };
    const createDefaultRoutes = (routeTypes: Record<string, string>, errorTypes: Record<string, string>) => {
      const x: RouteConfigMap<string, string> = {
      };
      const allErrorsEnabled = Object.keys(errorTypes).reduce((acc, val) => ({...acc, [val]: true}), {});
      for (const type of Object.values(routeTypes)) {
        x[type] = {
          authorization: false,
          context: async () => ({}),
          errors: {
            ...allErrorsEnabled,
          },
        };
      }
      return x;
    };
    const routeTypes = routeEnum ?? SampleRouteType;
    const errorTypes = errorEnum && routeEnum ? errorEnum : ErrorCode;
    const errorConfig = errorEnum && routeEnum && errors ? errors : defaultErrors;
    const routeConfig = errorEnum && routeEnum && errors && routes ? routes : createDefaultRoutes(routeTypes, errorTypes);
    const conf = errorEnum && routeEnum && errors && routes && spec ? spec : defaultConf;
    const config = {
      ...conf,
      routes: routeConfig,
      errors: errorConfig,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new OpenApi(routeTypes as any, errorTypes as any, config as any);
  }
}
