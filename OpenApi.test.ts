import {describe, expect, test} from 'vitest';
import {OpenApi} from './OpenApi';
import {OpenApiMethods} from './enums/OpenApiMethods';
import z from 'zod';

describe('OpenApi', () => {
  test('Happy Path', async () => {
    enum RouteType {
      Public = 'Public',
    }
    enum ErrorType {
      ApiError = 'ApiError'
    }
    const config = OpenApi.createConfig(RouteType, ErrorType,
      {
        ApiError: {
          description: 'An error occurred while processing the request.',
          status: '500',
          validator: z.object({
            message: z.string(),
          }),
        },
      },
      {
        Public: {
          authorization: false,
          context: async () => ({}),
          errors: {},
        },
      },
      {
        defaultErrorResponse: {
          message: 'Unknown error',
        },
        handleError: function() {
          throw new Error('Function not implemented.');
        },
        skipDescriptionsCheck: true,
      });
    const api = new OpenApi(RouteType, ErrorType, config);
    const route = api.factory.createRoute({
      type: RouteType.Public,
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
});
