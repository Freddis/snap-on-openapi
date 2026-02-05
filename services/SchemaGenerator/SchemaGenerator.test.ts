import {beforeEach, describe, expect, test} from 'vitest';
import {TestUtils} from '../TestUtils/TestUtils';
import {existsSync, mkdirSync, readFileSync, rmSync} from 'fs';
import z from 'zod';
import {Method} from '../../enums/Methods';
import {SampleRouteType} from '../../enums/SampleRouteType';
import {OpenApi} from '../../OpenApi';
import {ErrorCode} from '../../enums/ErrorCode';
import {notFoundErrorResponseValidator} from '../../types/errors/responses/NotFoundErrorResponse';
import {validationErrorResponseValidator} from '../../types/errors/responses/ValidationErrorResponse';
import {unknownErrorResponseValidator} from '../../types/errors/responses/UnknownErrorResponse';

describe('SchemaGenerator', () => {

  beforeEach(async () => {
    if (!existsSync('temp')) {
      mkdirSync('temp');
    }
    if (existsSync('temp/schema.yml')) {
      rmSync('temp/schema.yml');
    }
    if (existsSync('temp/schema.json')) {
      rmSync('temp/schema.json');
    }
  });

  test('Can create error unions on same status', async () => {
    const api = OpenApi.builder.customizeErrors(
      ErrorCode
    ).defineErrors({
      [ErrorCode.UnknownError]: {
        status: '500',
        description: 'Unknown Error',
        responseValidator: unknownErrorResponseValidator,
      },
      [ErrorCode.ValidationFailed]: {
        status: '500',
        description: 'Validation Error',
        responseValidator: validationErrorResponseValidator,
      },
      [ErrorCode.NotFound]: {
        status: '500',
        description: 'Not Found Error',
        responseValidator: notFoundErrorResponseValidator,
      },
    }).defineDefaultError({
      code: ErrorCode.UnknownError,
      body: {error: ErrorCode.UnknownError},
    }).customizeRoutes(
      SampleRouteType
    ).defineRoutes({
      [SampleRouteType.Public]: {
        authorization: false,
        errors: {
          NotFound: true,
        },
      },
    }).create();
    const expectedPartial = `
        "500":
          description: Unknown Error or Not Found Error
          content:
            application/json:
              schema:
                oneOf:
                  - type: object
                    properties:
                      error:
                        type: string
                        const: UnknownError
                        description: Code to handle on the frontend
                    required:
                      - error
                    description: Error response
                  - type: object
                    properties:
                      error:
                        type: string
                        const: NotFound
                        description: Code to handle on the frontend
                    required:
                      - error
                    description: Error response`;
    api.addRoute(api.factory.createRoute({
      type: SampleRouteType.Public,
      method: Method.GET,
      path: '/',
      description: 'Sample route',
      validators: {
        response: z.string().openapi({description: 'Sample response'}),
      },
      handler: () => Promise.resolve('something'),
    }));
    const yml = api.schemaGenerator.getYaml().toString();
    console.log(yml);
    expect(yml).toContain(expectedPartial);
  });
  test('Poperly prints POST methods schema', () => {
    const api = OpenApi.builder.customizeRoutes(SampleRouteType).defineRoutes({
      [SampleRouteType.Public]: {
        authorization: true,
      },
    }).create();
    api.addRoute(api.factory.createRoute({
      type: SampleRouteType.Public,
      method: Method.POST,
      path: '/',
      description: 'My post method',
      validators: {
        body: z.object({
          name: z.string().openapi({description: 'Name of something'}),
        }),
        response: z.string().openapi({description: 'Status'}),
      },
      handler: () => Promise.resolve('Hello'),
    }));
    const expectedPartial = `
  /:
    post:
      description: My post method
      security:
        - bearerHttpAuthentication: []
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                name:
                  type: string
                  description: Name of something
              required:
                - name
      responses:
        "200":
          description: Good Response
          content:
            application/json:
              schema:
                type: string
                description: Status`;
    const yml = api.schemaGenerator.getYaml().toString();
    expect(yml).toContain(expectedPartial);
  });

  test('Can save yaml schema to file', () => {
    const api = TestUtils.createOpenApi();
    expect(existsSync('/temp/schema.yml')).toBe(false);
    api.schemaGenerator.saveYaml('temp/schema.yml');
    readFileSync('temp/schema.yml');
    expect(existsSync('temp/schema.yml')).toBe(true);
  });

  test('Can save json schema to file', () => {
    const api = TestUtils.createOpenApi();
    expect(existsSync('/temp/schema.json')).toBe(false);
    api.schemaGenerator.saveJson('temp/schema.json');
    readFileSync('temp/schema.json');
    expect(existsSync('temp/schema.json')).toBe(true);
  });

  test('Correctly generates schema for undefined response', () => {
    const api = OpenApi.builder.customizeRoutes(SampleRouteType).defineRoutes({
      [SampleRouteType.Public]: {
        authorization: false,
      },
    }).defineGlobalConfig({
      basePath: '/api',
    }).create();
    api.addRoute(api.factory.createRoute({
      type: SampleRouteType.Public,
      method: Method.GET,
      path: '/',
      description: 'Test route',
      validators: {
        response: undefined,
      },
      handler: () => Promise.resolve(undefined),
    }));
    const yml = api.schemaGenerator.getYaml().toString();
    const regex = new RegExp('content', 'g');
    const matches = yml.match(regex);
    expect(matches).toBeDefined();
    expect(matches?.length, 'Content should appear only once for default error').toBe(1);
  });

  describe('Media Type Overriding', () => {
    test('Uses default application/json for response when not specified', () => {
      const api = OpenApi.builder.customizeRoutes(SampleRouteType).defineRoutes({
        [SampleRouteType.Public]: {
          authorization: false,
        },
      }).create();
      api.addRoute(api.factory.createRoute({
        type: SampleRouteType.Public,
        method: Method.GET,
        path: '/',
        description: 'Test route',
        validators: {
          response: z.string().openapi({description: 'Test response'}),
        },
        handler: () => Promise.resolve('test'),
      }));
      const yml = api.schemaGenerator.getYaml().toString();
      expect(yml).toContain('application/json:');
      expect(yml).toContain('schema:');
      expect(yml).toContain('type: string');
    });

    test('Can override response media type with multiple custom types', () => {
      const api = OpenApi.builder.customizeRoutes(SampleRouteType).defineRoutes({
        [SampleRouteType.Public]: {
          authorization: false,
        },
      }).defineGlobalConfig({
        basePath: '/api',
        generator: {
          responseMediaTypes: ['application/json', 'application/xml', 'text/plain'],
        },
      }).create();
      api.addRoute(api.factory.createRoute({
        type: SampleRouteType.Public,
        method: Method.GET,
        path: '/',
        description: 'Test route',
        validators: {
          response: z.string().openapi({description: 'Test response'}),
        },
        handler: () => Promise.resolve('test'),
      }));
      const yml = api.schemaGenerator.getYaml().toString();
      // Check that 200 response contains all media types
      const response200Section = yml.split('"200":')[1]?.split('"500":')[0] || '';
      expect(response200Section).toContain('application/json:');
      expect(response200Section).toContain('application/xml:');
      expect(response200Section).toContain('text/plain:');
    });

    test('Uses default application/json for request body when not specified', () => {
      const api = OpenApi.builder.customizeRoutes(SampleRouteType).defineRoutes({
        [SampleRouteType.Public]: {
          authorization: false,
        },
      }).create();
      api.addRoute(api.factory.createRoute({
        type: SampleRouteType.Public,
        method: Method.POST,
        path: '/',
        description: 'Test route',
        validators: {
          body: z.object({
            name: z.string().openapi({description: 'Name field'}),
          }),
          response: z.string().openapi({description: 'Response value'}),
        },
        handler: () => Promise.resolve('test'),
      }));
      const yml = api.schemaGenerator.getYaml().toString();
      const requestBodySection = yml.split('requestBody:')[1];
      expect(requestBodySection).toContain('application/json:');
    });

    test('Can override request media type with multiple custom types', () => {
      const api = OpenApi.builder.customizeRoutes(SampleRouteType).defineRoutes({
        [SampleRouteType.Public]: {
          authorization: false,
        },
      }).defineGlobalConfig({
        basePath: '/api',
        generator: {
          requestMediaTypes: ['application/json', 'application/x-www-form-urlencoded', 'multipart/form-data'],
        },
      }).create();
      api.addRoute(api.factory.createRoute({
        type: SampleRouteType.Public,
        method: Method.POST,
        path: '/',
        description: 'Test route',
        validators: {
          body: z.object({
            name: z.string().openapi({description: 'Name'}),
          }),
          response: z.string().openapi({description: 'Response value'}),
        },
        handler: () => Promise.resolve('test'),
      }));
      const yml = api.schemaGenerator.getYaml().toString();
      const requestBodySection = yml.split('requestBody:')[1];
      expect(requestBodySection).toContain('application/json:');
      expect(requestBodySection).toContain('application/x-www-form-urlencoded:');
      expect(requestBodySection).toContain('multipart/form-data:');
    });
  });

});
