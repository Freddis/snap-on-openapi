import 'zod-openapi/extend';
import {
  z,
  ZodArray,
  ZodObject,
  ZodRawShape,
  ZodTypeAny,
  ZodUnion,
  ZodUnionOptions,
} from 'zod';
import {OpenApiErrorCode} from './enums/OpenApiErrorCode';
import {ValidationLocations} from './enums/ValidationLocations';
import {OpenApiValidationError} from './types/errors/OpenApiValidationError';
import {OpenApiRoute} from './types/OpenApiRoute';
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


export class OpenApi<
  TRouteTypes extends Record<string, string>,
  TErrorCodes extends Record<string, string>,
  TSpec extends OpenApiConfig<TRouteTypes, TErrorCodes>
> {
  protected routes: OpenApiRoute<TRouteTypes[keyof TRouteTypes]>[] = [];
  protected logger: Logger;
  protected basePath = '';
  public readonly validators = {
    paginatedQuery: <X extends ZodRawShape>(filter: X) =>
      z
        .object({
          page: z.number().optional().openapi({description: 'Page number'}),
          pageSize: z.number().min(1).max(50).optional().default(10).openapi({
            description: 'Number of items to display in the page.',
          }),
        })
        .extend(filter)
        .openapi({description: 'Pagination parameters'}),
    paginatedResponse: <T extends ZodObject<ZodRawShape>| ZodUnion<ZodUnionOptions>>(arr: T) =>
      z.object({
        items: z.array(arr).openapi({description: 'Page or items'}),
        info: z
          .object({
            count: z.number().openapi({description: 'Total number of items'}),
            page: z.number().openapi({description: 'Current page'}),
            pageSize: z.number().openapi({description: 'Number of itemss per page'}),
          })
          .openapi({description: 'Pagination details'}),
      }),
    objects: {
    },
  };
  public readonly factory: RoutingFactory<TRouteTypes, TSpec>;
  protected spec: TSpec;


  constructor(a: TRouteTypes, b: TErrorCodes, spec: TSpec) {
    this.spec = spec;
    this.logger = new Logger('OpenAPI');
    this.factory = new RoutingFactory<TRouteTypes, TSpec>(spec);
  }


  public addRoute(pathExtension: string, routes: OpenApiRoute<TRouteTypes[keyof TRouteTypes]>[]) {
    const newRoutes = routes.map((x) => ({...x, path: pathExtension + x.path}));
    this.routes.push(...newRoutes);
  }

  public addRouteMap(routeMap: OpenApiRouteMap<TRouteTypes[keyof TRouteTypes]>) {
    for (const row of routeMap) {
      this.addRoute(row.path, row.routes);
    }
  }
  protected checkRouteDescriptions(route: OpenApiRoute<TRouteTypes[keyof TRouteTypes]>) {
    const minimalLength = 10;
    if (!route.description || route.description.length < minimalLength) {
      throw new Error(`Description for ${route.path} is missing or too small`);
    }
    this.checkValidatorDescriptions(route, 'responseValidator', 'responseValidator', route.validators.response);
    this.checkValidatorDescriptions(route, 'pathValidator', 'pathValidator', route.validators.path ?? z.object({}), false);
    this.checkValidatorDescriptions(route, 'queryValidator', 'queryValidator', route.validators.query ?? z.object({}), false);
    if (route.method === 'POST' && route.validators.body) {
      this.checkValidatorDescriptions(route, 'bodyValidator', 'bodyValidator', route.validators.body ?? z.object({}), false);
    }
  }

  protected checkValidatorDescriptions(
    route: OpenApiRoute<TRouteTypes[keyof TRouteTypes]>,
    validatorName: string,
    field: string | undefined,
    validator: ZodTypeAny,
    checkValidatorDescription = true,
  ) {
    const openapi = validator._def.openapi;
    if (checkValidatorDescription && !openapi?.description) {
      throw new Error(
        `Route '${route.method}:${route.path}': ${validatorName} missing openapi description on field ${field}`,
      );
    }
    // console.log(validator._def.typeName)
    if (validator._def.typeName === 'ZodArray') {
      const arr = validator as ZodArray<ZodObject<ZodRawShape>>;
      const nonPrimitiveArray = arr.element.shape !== undefined;
      if (nonPrimitiveArray) {
        this.checkShapeDescription(route, validatorName, arr.element.shape);
      }
    }
    if (validator._def.typeName === 'ZodEffects') {
      const msg = `Route '${route.method}:${route.path}': ${validatorName} on field ${field}: usage of transformers is forbidden`;
      throw new Error(msg);
    }
    if (validator._def.typeName === 'ZodObject') {
      const obj = validator as ZodObject<ZodRawShape>;
      this.checkShapeDescription(route, validatorName, obj.shape);
    }
  }
  protected checkShapeDescription(
    route: OpenApiRoute<TRouteTypes[keyof TRouteTypes]>,
    validatorName: string, shape: ZodRawShape
  ) {
    for (const field of Object.keys(shape)) {
      const value = shape[field] as ZodObject<ZodRawShape>;
      this.checkValidatorDescriptions(route, validatorName, field, value);
    }
  }

  protected getRouteForPath(path: string, method: string): OpenApiRoute<TRouteTypes[keyof TRouteTypes]> | null {
    const fittingRoutes: OpenApiRoute<TRouteTypes[keyof TRouteTypes]>[] = [];
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
        this.logger.info(`Route for ${originalReq.method}:${urlPath} no found`);
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
      return {status: Number(response.code), body: response.body};
    }
  }

  public saveYaml(path: string) {
    const generator = new SchemaGenerator(this.logger.getInvoker(), this.spec, this.routes);
    generator.saveYaml(path);
  }

  public static createConfig<
    TRouteTypes extends Record<string, string>,
    TErrorCodes extends Record<string, string>,
    TRouteConfigMap extends RouteConfigMap<TRouteTypes[keyof TRouteTypes], TErrorCodes[keyof TErrorCodes]>,
    TErrorMap extends OpenApiErrorConfigMap<TErrorCodes[keyof TErrorCodes]>,
    TSpec extends OpenApiNarrowConfig<TRouteTypes, TErrorCodes, TRouteConfigMap, TErrorMap>
  >(
    routeEnum: TRouteTypes,
    errorEnum: TErrorCodes,
    errors: TErrorMap,
    routes: TRouteConfigMap,
    spec: Omit<TSpec, 'errors'|'routes'>
  ): TSpec {
    const result: TSpec = {
      handleError: spec.handleError,
      routes,
      errors: errors,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
    return result;
  }
}
