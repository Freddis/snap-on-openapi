import {describe, expect, test} from 'vitest';
import {TestUtils} from './services/TestUtils/TestUtils';
import {OpenApiMethods} from './enums/OpenApiMethods';
import z from 'zod';
import {TestRoute} from './services/TestUtils/types/TestRoute';
import {OpenApi} from './OpenApi';

describe('OpenApi', () => {
  test('Happy Path', async () => {
    const api = TestUtils.createOpenApi();
    const route = api.factory.createRoute({
      type: TestRoute.Public,
      method: OpenApiMethods.get,
      path: 'test',
      description: '',
      validators: {
        response: z.string(),
      },
      handler: async () => {
        return '1';
      },
    });
    api.addRoute('', [route]);
    const req: Request = new Request('http://localhost/api/test', {
    });
    const response = await api.processRootRoute('/api', req);
    expect(response.status).toBe(200);
    expect(response.body).toBe('1');
  });

  describe('Static Constructor', () => {
    enum RouteType {
      User = 'User',
    }
    enum ErrorType {
      Unknown = 'Unknown'
    }

    test('Can be created without config', async () => {
      const defaultApi = OpenApi.create();
      const customApi = OpenApi.create(RouteType, ErrorType, {
        [ErrorType.Unknown]: {
          status: '200',
          description: '',
          validator: z.object({custom: z.string()}),
        },
      }, {
        [RouteType.User]: {
          authorization: true,
          context: async () => ({}),
          errors: {},
        },
      },
        {
          handleError: () => ({code: ErrorType.Unknown, body: {}}),
          defaultErrorResponse: {
            error: 'MyCustomError',
          },
        });

      const req: Request = new Request('http://localhost/api/test', {
      });
      const defaultResponse = await defaultApi.processRootRoute('/ds', req);
      const customResponse = await customApi.processRootRoute('/ds', req);
      expect(defaultResponse.body).toEqual({
        error: 'UnknownError',
      });

      expect(customResponse.body).toEqual({
        error: 'MyCustomError',
      });
    });

    test('Can be created only with enums', async () => {
      const customApi = OpenApi.create(RouteType, ErrorType);
      customApi.addRoute('/', [
        customApi.factory.createRoute({
          type: RouteType.User,
          method: OpenApiMethods.get,
          path: '',
          description: 'Default Api Route',
          validators: {
            response: z.string().openapi({description: 'Response string'}),
          },
          handler: async () => 'Hello',
        }),
      ]);
      const req = new Request('http://localhost',);
      const res = await customApi.processRootRoute('/', req);
      expect(res.status).toBe(200);
      expect(res.body).toBe('Hello');
    });

  });

});
