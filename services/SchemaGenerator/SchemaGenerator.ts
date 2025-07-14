import 'zod-openapi/extend';
import {writeFileSync} from 'fs';
import {stringify} from 'yaml';
import {createDocument, ZodOpenApiObject, ZodOpenApiOperationObject, ZodOpenApiParameters, ZodOpenApiPathsObject} from 'zod-openapi';
import {AnyRoute} from '../../types/AnyRoute';
import {z, ZodObject, ZodRawShape} from 'zod';
import {AnyConfig} from '../../types/config/AnyConfig';
import {ErrorConfig} from '../../types/config/ErrorConfig';
import {Method} from '../../enums/Methods';
import {Logger} from '../Logger/Logger';
import {Server} from '../../types/config/Server';
import {Info} from '../../types/config/Info';

export class SchemaGenerator<
  TRouteTypes extends string,
  TErrorCodes extends string,
  TConfig extends AnyConfig<TRouteTypes, TErrorCodes>
> {
  protected logger: Logger;
  protected info: Info;
  protected routes: AnyRoute<TRouteTypes>[];
  protected servers: Server[];
  protected routeSpec: TConfig;
  constructor(
    invoker: string,
    info: Info,
    spec: TConfig,
    routes: AnyRoute<TRouteTypes>[],
    servers: Server[],
  ) {
    this.logger = new Logger(SchemaGenerator.name, invoker);
    this.routes = routes;
    this.routeSpec = spec;
    this.servers = servers;
    this.info = info;
  }

  public getYaml(): string {
    const document = this.createDocument();
    const yaml = stringify(document, {aliasDuplicateObjects: false});
    return yaml;
  }

  public saveYaml(path: string) {
    this.logger.info('Generating YAML for Open API');
    const yaml = this.getYaml();
    writeFileSync(path, yaml);
  }

  protected createDocument(): ReturnType<typeof createDocument> {
    const openApi: ZodOpenApiObject = {
      openapi: '3.1.0',
      info: this.info,
      components: {
        securitySchemes: {
          bearerHttpAuthentication: {
            type: 'apiKey',
            scheme: 'bearer',
            bearerFormat: 'jwt',
            name: 'authorization',
            in: 'header',
          },
        },
      },
      paths: {},
      servers: this.servers,
    };
    const paths: ZodOpenApiPathsObject = {};
    for (const route of this.routes) {
      const operation = this.createOperation(route);
      const existingPath = paths[route.path] ?? {};
      paths[route.path] = {
        ...existingPath,
        [route.method.toLowerCase()]: operation,
      };
    }
    openApi.paths = paths;
    // this.logger.info('openApi', openApi)
    const document = createDocument(openApi, {
      unionOneOf: true,
      defaultDateSchema: {
        type: 'string', format: 'date-time',
      },
    });
    return document;
  }

  protected createOperation(
    route: AnyRoute<TRouteTypes>
  ): ZodOpenApiOperationObject {
    const requestParams: ZodOpenApiParameters = {
      query: route.validators.query,
      path: route.validators.path,
    };

    const operation: ZodOpenApiOperationObject = {
      requestParams: requestParams,
      description: route.description,
      responses: {
        200: {
          description: 'Good Response',
          content: {
            'application/json': {schema: route.validators.response},
          },
        },
      },
    };
    const enabledErrors = Object.keys(this.routeSpec.routes[route.type].errors ?? {});
    if (!enabledErrors.find((x) => x === this.routeSpec.defaultError.code)) {
      enabledErrors.push(this.routeSpec.defaultError.code);
    }
    const httpStatusMap: Map<string, ErrorConfig<ZodObject<ZodRawShape>>[]> = new Map();
    for (const [key, error] of Object.entries(this.routeSpec.errors)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorConfig = error as any as ErrorConfig<ZodObject<ZodRawShape>>;
      if (!enabledErrors.includes(key)) {
        continue;
      }
      const errors = httpStatusMap.get(errorConfig.status) ?? [];
      errors.push(errorConfig);
      httpStatusMap.set(errorConfig.status, errors);
    }
    for (const [code, errors] of httpStatusMap.entries()) {
      const error = errors[0];
      if (!error) {
        //never
        throw new Error(`No errors found for code '${code}'`);
      }
      const description = errors.map((x) => x.description).join(' or ');
      const validators = errors.map((x) => x.responseValidator) as [ZodObject<ZodRawShape>, ZodObject<ZodRawShape>];
      const schema = errors.length === 1 ? error.responseValidator : z.union(validators).openapi({unionOneOf: true});
      operation.responses[error.status] = {
        description: description,
        content: {
          'application/json': {
            schema: schema,
          },
        },
      };
    }
    if (this.routeSpec.routes[route.type].authorization) {
      operation.security = [
        {
          bearerHttpAuthentication: [],
        },
      ];
    }
    if (route.method !== Method.GET) {
      operation.requestBody = {
        content: {
          'application/json': {schema: route.validators.body},
        },
      };
    }
    return operation;
  }
}
