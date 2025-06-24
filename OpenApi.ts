import 'zod-openapi/extend';
import {OpenApiErrorCode} from './enums/OpenApiErrorCode';
import {ValidationLocations} from './enums/ValidationLocations';
import {OpenApiValidationError} from './types/errors/OpenApiValidationError';
import {AnyRoute} from './types/AnyRoute';
import {RoutingFactory} from './services/RoutingFactory/RoutingFactory';
import {OpenApiRouteMap} from './types/OpenApiRouteMap';
import {SchemaGenerator} from './services/SchemaGenerator/SchemaGenerator';
import {OpenApiMethods} from './enums/OpenApiMethods';
import {Validator} from './services/Validator/Validator';
import {OpenApiConfig} from './types/OpenApiConfig';
import {RouteConfigMap} from './types/RouteConfigMap';
import {OpenApiErrorConfigMap} from './types/OpenApiErrorConfigMap';
import {OpenApiBuiltInError} from './types/errors/OpenApiBuiltInError';
import {OpenApiNarrowConfig} from './types/OpenApiNarrowConfig';
import {Logger} from './services/Logger/Logger';
import {DescriptionChecker} from './services/DescriptionChecker/DescriptionChecker';
import {DevelopmentUtils} from './services/DevelopmentUtils/DevelopmentUtils';
import {ClientGenerator} from './services/ClientGenerator/ClientGenerator';
import {ValidationUtils} from './services/ValidationUtils/ValidationUtils';
import {OpenApiSampleRouteType} from './types/OpenApiSampleRouteType';
import z from 'zod';

export class OpenApi<
  TRouteTypes extends Record<string, string>,
  TErrorCodes extends Record<string, string>,
  TConfig extends OpenApiConfig<TRouteTypes, TErrorCodes>
> {
  public readonly validators: ValidationUtils = new ValidationUtils();
  public readonly factory: RoutingFactory<TRouteTypes, TConfig>;
  public readonly schemaGenerator: SchemaGenerator<TRouteTypes, TConfig>;
  public readonly clientGenerator: ClientGenerator<TRouteTypes, TErrorCodes, TConfig> = new ClientGenerator(this);

  protected routes: AnyRoute<TRouteTypes[keyof TRouteTypes]>[] = [];
  protected logger: Logger;
  protected basePath = '';
  protected developmentUtils: DevelopmentUtils;
  protected spec: TConfig;
  protected descriptionChecker: DescriptionChecker;

  protected constructor(a: TRouteTypes, b: TErrorCodes, spec: TConfig) {
    this.spec = spec;
    this.logger = new Logger('OpenAPI');
    this.descriptionChecker = new DescriptionChecker();
    this.developmentUtils = new DevelopmentUtils();
    this.factory = new RoutingFactory<TRouteTypes, TConfig>(spec);
    this.schemaGenerator = new SchemaGenerator(this.logger.getInvoker(), this.spec, this.routes);
  }

  public addRoute(pathExtension: string, routes: AnyRoute<TRouteTypes[keyof TRouteTypes]>[]) {
    const newRoutes = routes.map((x) => ({...x, path: pathExtension + x.path}));
    if (!this.spec.skipDescriptionsCheck) {
      this.descriptionChecker.checkRoutes(newRoutes);
    }
    this.routes.push(...newRoutes);
  }

  public addRouteMap(routeMap: OpenApiRouteMap<TRouteTypes[keyof TRouteTypes]>) {
    for (const row of routeMap) {
      this.addRoute(row.path, row.routes);
    }
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
    basePath: string,
    originalReq: Request
  ): Promise<{status: number; body: unknown}> {
    try {
      const url = new URL(originalReq.url);
      const urlPath = url.pathname.replace(basePath, '');
      const route = this.getRouteForPath(urlPath, originalReq.method);
      if (!route) {
        this.logger.info(`Route for ${originalReq.method}:${urlPath} not found`);
        throw new OpenApiBuiltInError(OpenApiErrorCode.NotFound);
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

      let body = {};
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
        throw new OpenApiValidationError(query.error, ValidationLocations.query);
      }
      const path = validator.validatePath(route.validators.path, req.params);
      if (!path.success) {
        throw new OpenApiValidationError(path.error, ValidationLocations.path);
      }
      let response: unknown;
      const containsBody = route.method !== OpenApiMethods.get;
      if (containsBody && route.validators.body) {
        const body = validator.validateBody(route.validators.body, req.body);
        if (!body.success) {
          throw new OpenApiValidationError(body.error, ValidationLocations.body);
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
        throw new OpenApiValidationError(validated.error, ValidationLocations.response);
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
    typeof OpenApiSampleRouteType,
    typeof OpenApiErrorCode,
    OpenApiConfig<typeof OpenApiSampleRouteType, typeof OpenApiErrorCode>
  >;

  public static create<TRouteTypes extends Record<string, string>, TErrorCodes extends Record<string, string>, >(
    routeEnum: TRouteTypes,
    errorEnum: TErrorCodes,
  ): OpenApi<TRouteTypes, TErrorCodes, OpenApiConfig<TRouteTypes, TErrorCodes>>

  public static create<
    TRouteTypes extends Record<string, string>,
    TErrorCodes extends Record<string, string>,
    TRouteConfigMap extends RouteConfigMap<TRouteTypes[keyof TRouteTypes], TErrorCodes[keyof TErrorCodes]>,
    TErrorMap extends OpenApiErrorConfigMap<TErrorCodes[keyof TErrorCodes]>,
    TConfig extends OpenApiNarrowConfig<TRouteTypes, TErrorCodes, TRouteConfigMap, TErrorMap>
  >(
    routeEnum: TRouteTypes,
    errorEnum: TErrorCodes,
    errors: TErrorMap,
    routes: TRouteConfigMap,
    spec: Omit<TConfig, 'errors'|'routes'>
  ): OpenApi<TRouteTypes, TErrorCodes, OpenApiConfig<TRouteTypes, TErrorCodes>>

  public static create<
    TRouteTypes extends Record<string, string>,
    TErrorCodes extends Record<string, string>,
    TRouteConfigMap extends RouteConfigMap<TRouteTypes[keyof TRouteTypes], TErrorCodes[keyof TErrorCodes]>,
    TErrorMap extends OpenApiErrorConfigMap<TErrorCodes[keyof TErrorCodes]>,
    TConfig extends OpenApiNarrowConfig<TRouteTypes, TErrorCodes, TRouteConfigMap, TErrorMap>
  >(
    routeEnum?: TRouteTypes,
    errorEnum?: TErrorCodes,
    errors?: TErrorMap,
    routes?: TRouteConfigMap,
    spec?: Omit<TConfig, 'errors'|'routes'>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): OpenApi<any, any, any> {
    const defaultErrors: OpenApiErrorConfigMap<OpenApiErrorCode> = {
      [OpenApiErrorCode.UnknownError]: {
        status: '500',
        description: 'Unknown Api Error',
        validator: z.object({
          error: z.literal(OpenApiErrorCode.UnknownError),
        }),
      },
      [OpenApiErrorCode.ValidationFailed]: {
        status: '422',
        description: '',
        validator: z.object({
          error: z.literal(OpenApiErrorCode.ValidationFailed),
        }),
      },
      [OpenApiErrorCode.NotFound]: {
        status: '404',
        description: 'Route Not Found',
        validator: z.object({
          error: z.literal(OpenApiErrorCode.NotFound),
        }),
      },
    };
    type DefaultConf = OpenApiNarrowConfig<
      typeof OpenApiSampleRouteType,
      typeof OpenApiErrorCode,
      RouteConfigMap<OpenApiSampleRouteType, OpenApiErrorCode>,
      OpenApiErrorConfigMap<OpenApiErrorCode>
    >
    const defaultConf: Omit<DefaultConf, 'errors'| 'routes'> = {
      handleError: () => {
        return {code: OpenApiErrorCode.UnknownError, body: {error: OpenApiErrorCode.UnknownError}};
      },
      defaultErrorResponse: {
        error: OpenApiErrorCode.UnknownError,
      },
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
    const routeTypes = routeEnum ?? OpenApiSampleRouteType;
    const errorTypes = errorEnum && routeEnum ? errorEnum : OpenApiErrorCode;
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
