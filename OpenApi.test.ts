import {describe, expect, test} from 'vitest';
import {TestUtils} from './services/TestUtils/TestUtils';
import {Methods} from './enums/Methods';
import z from 'zod';
import {OpenApi} from './OpenApi';
import {SampleRouteType} from './enums/SampleRouteType';

describe('OpenApi', () => {

  test('Happy Path', async () => {
    const api = OpenApi.builder.create();
    const route = api.factory.createRoute({
      type: SampleRouteType.Public,
      method: Methods.GET,
      path: '/test',
      description: 'My Test Route',
      validators: {
        response: z.string().openapi({description: 'Test Response'}),
      },
      handler: async () => {
        return '1';
      },
    });
    api.addRoutes('/', [route]);
    const req: Request = new Request('http://localhost/api/test', {});
    const response = await api.processRootRoute(req);
    expect(response.status).toBe(200);
    expect(response.body).toBe('1');
  });

  describe('Context and Route Props Constructor', () => {
    enum RouteType {
      User = 'User',
    }

    test('Context is working', async () => {
      const api = OpenApi.builder.customizeRoutes(
        RouteType
      ).defineRoutes({
        [RouteType.User]: {
          contextFactory: async () => {
            return {currentPeremission: 'user'};
          },
          authorization: false,
        },
      }).create();
      const route = api.factory.createRoute({
        type: RouteType.User,
        method: Methods.GET,
        path: '/',
        description: 'My fantastic route',
        validators: {
          response: z.string().openapi({description: 'response'}),
        },
        handler: async (context) => {
          return context.currentPeremission;
        },
      });
      api.addRoutes('/', [route]);

      const req = TestUtils.createRequest('/api', Methods.GET);
      const res = await api.processRootRoute(req);
      expect(res.status).toBe(200);
      expect(res.body).toBe('user');
    });

    test('Route props working', async () => {
      const api = OpenApi.builder.customizeRoutes(
      RouteType
      ).defineRouteExtraParams({
        [RouteType.User]: z.object({
          permission: z.enum(['read', 'write']),
        }),
      }).defineRoutes({
        [RouteType.User]: {
          authorization: false,
          contextFactory: async (ctx) => {
            return {
              routePermission: ctx.route.permission,
            };
          },
        },
      }).create();
      const route = api.factory.createRoute({
        type: RouteType.User,
        method: Methods.GET,
        path: '/',
        description: 'Something long',
        validators: {
          response: z.string().openapi({description: 'Hello threre'}),
        },
        handler: async (context) => context.routePermission,
        permission: 'read',
      });
      api.addRoutes('/', [route]);
      const req = TestUtils.createRequest('/api', Methods.GET);
      const res = await api.processRootRoute(req);
      expect(res.status).toBe(200);
      expect(res.body).toBe('read');
    });
  });
});
