import {writeFileSync} from 'fs';
import {stringify} from 'yaml';
import {createDocument, ZodOpenApiObject, ZodOpenApiOperationObject, ZodOpenApiParameters, ZodOpenApiPathsObject} from 'zod-openapi';
import {OpenApiRoute} from '../../types/OpenApiRoute';
import {z, ZodObject, ZodRawShape} from 'zod';
import {OpenApiConfig} from '../../types/OpenApiConfig';
import {OpenApiErrorConfig} from '../../types/OpenApiErrorConfig';
import {OpenApiMethods} from '../../enums/OpenApiMethods';
import {Logger} from '../Logger/Logger';

export class SchemaGenerator<
  TRouteTypes extends Record<string, string>,
  TSpec extends OpenApiConfig<TRouteTypes, Record<string, string>>
> {
  protected logger: Logger;
  protected basePath: string = '';
  protected routes: OpenApiRoute<TRouteTypes[keyof TRouteTypes]>[];
  protected routeSpec: TSpec;
  constructor(
    invoker: string,
    spec: TSpec,
    routes: OpenApiRoute<TRouteTypes[keyof TRouteTypes]>[]
  ) {
    this.logger = new Logger(SchemaGenerator.name, invoker);
    this.routes = routes;
    this.routeSpec = spec;
  }

  public saveYaml(path: string) {
    this.logger.info('Generating YAML for Open API');
    const document = this.createDocument();
    const yaml = stringify(document, {aliasDuplicateObjects: false});
    writeFileSync(path, yaml);
  }

  protected createDocument(): ReturnType<typeof createDocument> {
    const openApi: ZodOpenApiObject = {
      openapi: '3.1.0',
      info: {
        title: 'My API',
        version: '1.0.0',
      },
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
      servers: [
        {
          url: 'http://localhost:3000/api/v1' + this.basePath,
          description: 'Local',
        },
        {
          url: 'https://discipline.alex-sarychev.com/api/v1' + this.basePath,
          description: 'Production',
        },
      ],
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
    route: OpenApiRoute<TRouteTypes[keyof TRouteTypes]>
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
    const enabledErrors = Object.keys(this.routeSpec.routes[route.type].errors);
    const httpStatusMap: Map<string, OpenApiErrorConfig<ZodObject<ZodRawShape>>[]> = new Map();
    for (const [key, error] of Object.entries(this.routeSpec.errors)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorConfig = error as any as OpenApiErrorConfig<ZodObject<ZodRawShape>>;
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
      const validators = errors.map((x) => x.validator) as [ZodObject<ZodRawShape>, ZodObject<ZodRawShape>];
      const schema = errors.length === 1 ? error.validator : z.union(validators).openapi({unionOneOf: true});
      console.log(schema);
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
    if (route.method !== OpenApiMethods.get) {
      operation.requestBody = {
        content: {
          'application/json': {schema: route.validators.body},
        },
      };
    }
    return operation;
  }
}
