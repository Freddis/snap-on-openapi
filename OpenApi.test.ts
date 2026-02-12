import {afterEach, beforeEach, describe, expect, test} from 'vitest';
import {TestUtils} from './services/TestUtils/TestUtils';
import {Method} from './enums/Methods';
import z, {number, object, string} from 'zod';
import {OpenApi} from './OpenApi';
import {SampleRouteType} from './enums/SampleRouteType';
import {ErrorCode} from './enums/ErrorCode';
import {ValidationLocation} from './enums/ValidationLocations';
import {RouteMap} from './types/RouteMap';
import {LogLevel} from './services/Logger/types/LogLevel';
import {DefaultConfig} from './services/ConfigBuilder/types/DefaultConfig';
import {Logger} from './services/Logger/Logger';

describe('OpenApi', () => {

  test('Happy Path', async () => {
    const api = OpenApi.builder.create();
    const route = api.factory.createRoute({
      type: SampleRouteType.Public,
      method: Method.GET,
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

  describe('Logging', () => {
    const consoleLogBackup = console.log;
    let messages: unknown[] = [];
    beforeEach(() => {
      messages = [];
      console.log = (...args:unknown[]) => {
        messages.push(...args);
        consoleLogBackup(...args);
      };
    });
    afterEach(() => {
      console.log = consoleLogBackup;
    });

    test('Log level can be controlled', async () => {
      const api = OpenApi.builder.defineGlobalConfig({
        basePath: '/api',
        skipDescriptionsCheck: true,
      }).create();
      const route = api.factory.createRoute({
        method: Method.GET,
        type: SampleRouteType.Public,
        path: '/',
        description: 'My test route',
        validators: {
          response: z.number(),
        },
        handler: async () => 1,
      });
      api.addRoute(route);
      //test
      const response = await TestUtils.sendRequest(api, '/api', Method.GET);
      //check
      expect(response.status).toBe(200);
      expect(messages[0]).toContain('Calling route /');
    });

    test('Logs can be suppressed', async () => {
      const api = OpenApi.builder.defineGlobalConfig({
        basePath: '/api',
        skipDescriptionsCheck: true,
        logLevel: LogLevel.error,
      }).create();
      const route = api.factory.createRoute({
        method: Method.GET,
        type: SampleRouteType.Public,
        path: '/',
        description: 'My test route',
        validators: {
          response: z.number(),
        },
        handler: async () => 1,
      });
      api.addRoute(route);
      //test
      const response = await TestUtils.sendRequest(api, '/api', Method.GET);
      //check
      expect(response.status).toBe(200);
      expect(messages.length, 'No logs should be shown').toBe(0);
    });


    test('Logger can be overriden', async () => {
      class MooLogger extends Logger {
        protected override log(): void {
          console.log('moo');
        }
      }
      const api = OpenApi.builder.defineGlobalConfig({
        basePath: '/api',
        skipDescriptionsCheck: true,
        logger: new MooLogger('Moo'),
        logLevel: LogLevel.all,
      }).create();
      const route = api.factory.createRoute({
        method: Method.GET,
        type: SampleRouteType.Public,
        path: '/',
        description: 'My test route',
        validators: {
          response: z.number(),
        },
        handler: async () => 1,
      });
      api.addRoute(route);
      //test
      const response = await TestUtils.sendRequest(api, '/api', Method.GET);
      //check
      expect(response.status).toBe(200);
      expect(messages[0], 'Logs should be changed to "moo" lines').toBe('moo');
    });

    test('Request logs can be overridden', async () => {
      const logger = TestUtils.getTestLogger();
      const api = OpenApi.builder.defineGlobalConfig({
        basePath: '/api',
        skipDescriptionsCheck: true,
        logger,
        logLevel: LogLevel.all,
        onRequest: async (e) => {
          e.logger.info('onRequest', {url: e.request.url});
        },
      }).create();
      const response = await TestUtils.sendRequest(api, '/api/hi', Method.GET);
      expect(response.status).toBe(404);
      const message = logger.shiftMessage();
      console.log(message);
      expect(message, 'log should be called').not.toBeUndefined();
      expect(message?.message, 'The log data should be the request').toBe('onRequest');
      expect(message?.data, 'The log data should be the request').toEqual({url: 'http://localhost/api/hi'});
    });

    test('Log event receive extra props on routes', async () => {
      enum RouteType {
        Public = 'Public',
        User = 'User',
      }
      const logger = TestUtils.getTestLogger();
      const api = OpenApi.builder.customizeRoutes(RouteType).defineRouteExtraProps({
        [RouteType.Public]: z.object({
          permission: z.string(),
        }),
        [RouteType.User]: z.object({
          permission: z.string(),
        }),
      }).defineRoutes({
        [RouteType.Public]: {
          authorization: false,
        },
        [RouteType.User]: {
          authorization: true,
        },
      }).defineGlobalConfig({
        basePath: '/',
        skipDescriptionsCheck: true,
        logger,
        onRoute: async (e) => {
          e.logger.info('onRoute', {permisson: e.route.permission});
        },
      }).create();
      const route = api.factory.createRoute({
        method: Method.GET,
        type: RouteType.Public,
        path: '/',
        description: 'My test route',
        validators: {
          response: z.number(),
        },
        handler: async () => 1,
        permission: 'testPermission',
      });
      api.addRoute(route);
      const response = await TestUtils.sendRequest(api, '/', Method.GET);
      expect(response.status).toBe(200);
      const message = logger.shiftMessage();
      expect(message?.message).toBe('onRoute');
      expect(message?.data).toEqual({permisson: 'testPermission'});
    });
  });


  test('Has 1 default server and it should be localhost', async () => {
    const api = OpenApi.builder.create();
    const servers = api.getServers();
    expect(servers[0]?.url, 'Default server URL is incorrect').toBe('/api');
    expect(servers[0]?.description, 'Default server description is incorrect').toBe('Local');
  });

  test('Can add more servers', async () => {
    const api = OpenApi.builder.create();
    api.addServer('http://production-website.com/api', 'Production');
    const servers = api.getServers();
    expect(servers[1]?.url, 'URL is incorrect').toBe('http://production-website.com/api');
    expect(servers[1]?.description, 'Description is incorrect').toBe('Production');
  });

  test('Routes can be added via routemap', async () => {
    // prepare
    const api = OpenApi.builder.defineGlobalConfig({
      basePath: '/api',
      skipDescriptionsCheck: true,
    }).create();
    const route1 = api.factory.createRoute({
      method: Method.GET,
      type: SampleRouteType.Public,
      path: '/one',
      description: 'My test route',
      validators: {
        response: z.number(),
      },
      handler: async () => 1,
    });
    const route2 = api.factory.createRoute({
      method: Method.GET,
      type: SampleRouteType.Public,
      path: '/two',
      description: 'My test route',
      validators: {
        response: z.number(),
      },
      handler: async () => 2,
    });
    const route3 = api.factory.createRoute({
      method: Method.GET,
      type: SampleRouteType.Public,
      path: '/three',
      description: 'My test route',
      validators: {
        response: z.number(),
      },
      handler: async () => 3,
    });
    const routeMap: RouteMap<SampleRouteType> = {
      '/path1': [
        route1,
        route3,
      ],
      '/path2': [
        route2,
      ],
    };
    // test
    api.addRouteMap(routeMap);

    //check
    const response1 = await TestUtils.sendRequest(api, '/path1/one', Method.GET);
    expect(response1.body).toBe(1);
    const response2error = await TestUtils.sendRequest(api, '/path1/two', Method.GET);
    expect(response2error.status).toBe(404);
    const response2 = await TestUtils.sendRequest(api, '/path2/two', Method.GET);
    expect(response2.body).toBe(2);
    const response3 = await TestUtils.sendRequest(api, '/path1/three', Method.GET);
    expect(response3.body).toBe(3);
  });

  describe('Context and Route Props Constructor', () => {
    enum RouteType {
      User = 'User',
    }

    test('Context is working', async () => {
      const api = OpenApi.builder.customizeRoutes(
        RouteType
      ).defineRouteContexts({
        [RouteType.User]: async () => {
          return {currentPermission: 'user'};
        },
      }).defineRoutes({
        [RouteType.User]: {
          authorization: false,
        },
      }).create();
      const route = api.factory.createRoute({
        type: RouteType.User,
        method: Method.GET,
        path: '/',
        description: 'My fantastic route',
        validators: {
          response: z.string().openapi({description: 'response'}),
        },
        handler: async (context) => {
          return context.currentPermission;
        },
      });
      api.addRoutes('/', [route]);

      const req = TestUtils.createRequest('/api', Method.GET);
      const res = await api.processRootRoute(req);
      expect(res.status).toBe(200);
      expect(res.body).toBe('user');
    });

    test('Route props working', async () => {
      const api = OpenApi.builder.customizeRoutes(
      RouteType
      ).defineRouteExtraProps({
        [RouteType.User]: z.object({
          permission: z.enum(['read', 'write']),
        }),
      }).defineRouteContexts({
        [RouteType.User]: async (ctx) => {
          return {
            routePermission: ctx.route.permission,
          };
        },
      }).defineRoutes({
        [RouteType.User]: {
          authorization: false,
        },
      }).create();
      const route = api.factory.createRoute({
        type: RouteType.User,
        method: Method.GET,
        path: '/',
        description: 'Something long',
        validators: {
          response: z.string().openapi({description: 'Hello threre'}),
        },
        handler: async (context) => context.routePermission,
        permission: 'read',
      });
      api.addRoutes('/', [route]);
      const req = TestUtils.createRequest('/api', Method.GET);
      const res = await api.processRootRoute(req);
      expect(res.status).toBe(200);
      expect(res.body).toBe('read');
    });

    test('Wrapper factory is working', async () => {
      const api = OpenApi.builder.customizeRoutes(
        RouteType
      ).defineRouteContexts({
        [RouteType.User]: async () => {
          return {currentPermission: 'user'};
        },
      }).defineRoutes({
        [RouteType.User]: {
          authorization: false,
          handlerWrapper: async () => {
            return {body: 'overriden', status: 200, headers: {}};
          },
        },
      }).create();
      const route = api.factory.createRoute({
        type: RouteType.User,
        method: Method.GET,
        path: '/',
        description: 'My fantastic route',
        validators: {
          response: z.string().openapi({description: 'response'}),
        },
        handler: async (context) => {
          return context.currentPermission;
        },
      });
      api.addRoutes('/', [route]);

      const req = TestUtils.createRequest('/api', Method.GET);
      const res = await api.processRootRoute(req);
      expect(res.status).toBe(200);
      expect(res.body).toBe('overriden');
    });

  });

  test('Can respond with headers', async () => {
    const api = OpenApi.builder.create();
    const route = api.factory.createCustomRoute({
      method: Method.GET,
      type: SampleRouteType.Public,
      path: '/',
      description: 'My test route',
      validators: {
        response: z.string().openapi({description: 'response'}),
        responseHeaders: z.object({
          Custom: z.string().openapi({description: 'Authorization header'}),
        }),
      },
      handler: async () => ({
        body: '1',
        headers: {Custom: 'Custom Header'},
        status: 200,
      }),
    });
    api.addRoute(route);
    const req = TestUtils.createRequest('/api', Method.GET);
    const res = await api.processRootRoute(req);
    expect(res.status).toBe(200);
    expect(res.body).toBe('1');
    expect(res.headers.Custom).toBe('Custom Header');
  });


  describe('Route params', async () => {

    test('Longer routes are prioritized', async () => {
      const api = OpenApi.builder.defineGlobalConfig({
        basePath: '/api',
        skipDescriptionsCheck: true,
      }).create();
      const route = api.factory.createRoute({
        method: Method.GET,
        type: SampleRouteType.Public,
        path: '/{q}',
        description: 'My test route',
        validators: {
          path: z.object({
            q: api.validators.strings.number,
          }),
          response: z.string(),
        },
        handler: async () => '/user/{q}',
      });
      const route2 = api.factory.createRoute({
        method: Method.GET,
        type: SampleRouteType.Public,
        path: '/',
        description: 'My test route',
        validators: {
          response: z.string(),
        },
        handler: async () => '/user',
      });
      api.addRoutes('/user', [route, route2]);
      const response = await TestUtils.sendRequest(api, '/api/user', Method.GET);
      expect(response.status).toBe(200);
      expect(response.body).toBe('/user');
    });

    test('Can process path params', async () => {
      const api = OpenApi.builder.defineGlobalConfig({
        basePath: '/api',
        skipDescriptionsCheck: true,
      }).create();
      const route = api.factory.createRoute({
        method: Method.GET,
        type: SampleRouteType.Public,
        path: '/{q}',
        description: 'My test route',
        validators: {
          path: z.object({
            q: api.validators.strings.number,
          }),
          response: z.number(),
        },
        handler: async (ctx) => ctx.params.path.q,
      });
      api.addRoute(route);
      //test
      const response = await TestUtils.sendRequest(api, '/api/32', Method.GET);
      //check
      expect(response.status).toBe(200);
      expect(response.body).toEqual(32);
    });

    test('Can process multiple path params', async () => {
      const api = OpenApi.builder.defineGlobalConfig({
        basePath: '/api',
        skipDescriptionsCheck: true,
      }).create();
      const route = api.factory.createRoute({
        method: Method.GET,
        type: SampleRouteType.Public,
        path: '/{name}/{age}',
        description: 'My test route',
        validators: {
          path: z.object({
            name: string(),
            age: api.validators.strings.number,
          }),
          response: object({
            name: string(),
            age: number(),
          }),
        },
        handler: async (ctx) => ctx.params.path,
      });
      api.addRoute(route);
      //test
      const response = await TestUtils.sendRequest(api, '/api/alex/32', Method.GET);
      //check
      expect(response.status).toBe(200);
      expect(response.body.name).toEqual('alex');
      expect(response.body.age).toEqual(32);
    });

    test('Can process arrays in query', async () => {
      const api = OpenApi.builder.defineGlobalConfig({
        basePath: '/api',
        skipDescriptionsCheck: true,
      }).create();
      const route = api.factory.createRoute({
        method: Method.GET,
        type: SampleRouteType.Public,
        path: '/',
        description: 'My test route',
        validators: {
          query: z.object({
            ids: api.validators.strings.number.array(),
          }),
          response: z.number().array(),
        },
        handler: async (ctx) => ctx.params.query.ids,
      });
      api.addRoute(route);
      //test
      const response = await TestUtils.sendRequest(api, '/api/?ids=1&ids=2&ids=3', Method.GET);
      //check
      expect(response.status).toBe(200);
      expect(response.body).toEqual([1, 2, 3]);

    });
  });

  describe('URL decoding', () => {
    // const decodedCity = 'Düsseldorf';
    // const encodedCity = 'D%C3%BCsseldorf';

    test('Path params are URL-decoded', async () => {
      const api = OpenApi.builder.defineGlobalConfig({
        basePath: '/api',
        skipDescriptionsCheck: true,
      }).create();
      const route = api.factory.createRoute({
        method: Method.GET,
        type: SampleRouteType.Public,
        path: '/city/{city}',
        description: 'Returns path param for decoding check',
        validators: {
          path: z.object({
            city: string(),
          }),
          response: z.object({city: string()}),
        },
        handler: async (ctx) => ({city: ctx.params.path.city}),
      });
      api.addRoute(route);
      const response = await TestUtils.sendRequest(
        api,
        '/api/city/D%C3%BCsseldorf',
        Method.GET
      );
      expect(response.status).toBe(200);
      expect(response.body).toEqual({city: 'Düsseldorf'});
    });

    test('Query params are URL-decoded', async () => {
      const api = OpenApi.builder.defineGlobalConfig({
        basePath: '/api',
        skipDescriptionsCheck: true,
      }).create();
      const route = api.factory.createRoute({
        method: Method.GET,
        type: SampleRouteType.Public,
        path: '/',
        description: 'Returns query param for decoding check',
        validators: {
          query: z.object({
            city: string(),
          }),
          response: z.object({city: string()}),
        },
        handler: async (ctx) => ({city: ctx.params.query.city}),
      });
      api.addRoute(route);
      const response = await TestUtils.sendRequest(
        api,
        '/api?city=D%C3%BCsseldorf',
        Method.GET
      );
      expect(response.status).toBe(200);
      expect(response.body).toEqual({city: 'Düsseldorf'});
    });

    test('Query array values are URL-decoded', async () => {
      const api = OpenApi.builder.defineGlobalConfig({
        basePath: '/api',
        skipDescriptionsCheck: true,
      }).create();
      const route = api.factory.createRoute({
        method: Method.GET,
        type: SampleRouteType.Public,
        path: '/',
        description: 'Returns query array for decoding check',
        validators: {
          query: z.object({
            cities: z.array(string()),
          }),
          response: z.object({cities: z.array(string())}),
        },
        handler: async (ctx) => ({cities: ctx.params.query.cities}),
      });
      api.addRoute(route);
      const response = await TestUtils.sendRequest(
        api,
        '/api?cities=D%C3%BCsseldorf&cities=T%C3%BCrkiye',
        Method.GET
      );
      expect(response.status).toBe(200);
      expect(response.body).toEqual({cities: ['Düsseldorf', 'Türkiye']});
    });
  });

  describe('Validation and Errors', () => {
    test('Validates path', async () => {
      const api = OpenApi.builder.defineGlobalConfig({
        basePath: '/api',
        skipDescriptionsCheck: true,
      }).create();
      const route = api.factory.createRoute({
        method: Method.GET,
        type: SampleRouteType.Public,
        path: '/{id}',
        description: 'My test route',
        validators: {
          path: z.object({
            id: api.validators.strings.number,
          }),
          response: z.object({ok: z.boolean()}),
        },
        handler: async () => ({ok: true}),
      });
      api.addRoute(route);
      //pre-check
      const response = await TestUtils.sendRequest(api, '/api/23', Method.GET);
      expect(response.body.ok).toBe(true);
      const response2 = await TestUtils.sendRequest(api, '/api/check', Method.GET);
      expect(response2.status).toBe(400);
      expect(response2.body?.error?.code).toBe(ErrorCode.ValidationFailed);
      expect(response2.body?.error?.location).toBe(ValidationLocation.Path);
    });

    test('Validates query', async () => {
      const api = OpenApi.builder.defineGlobalConfig({
        basePath: '/api',
        skipDescriptionsCheck: true,
      }).create();
      const route = api.factory.createRoute({
        method: Method.GET,
        type: SampleRouteType.Public,
        path: '/',
        description: 'My test route',
        validators: {
          query: z.object({
            id: api.validators.strings.number,
          }),
          response: z.object({ok: z.boolean()}),
        },
        handler: async () => ({ok: true}),
      });
      api.addRoute(route);
      //pre-check
      const response = await TestUtils.sendRequest(api, '/api/?id=12', Method.GET);
      expect(response.body.ok).toBe(true);
      const response2 = await TestUtils.sendRequest(api, '/api/?id=check', Method.GET);
      expect(response2.status).toBe(400);
      expect(response2.body?.error?.code).toBe(ErrorCode.ValidationFailed);
      expect(response2.body?.error?.location).toBe(ValidationLocation.Query);
    });

    test('Validates response', async () => {
      const api = OpenApi.builder.defineGlobalConfig({
        basePath: '/api',
        skipDescriptionsCheck: true,
      }).create();
      const route = api.factory.createRoute({
        method: Method.GET,
        type: SampleRouteType.Public,
        path: '/',
        description: 'My test route',
        validators: {
          response: z.object({ok: z.boolean()}),
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handler: async () => ({ok: 1 as any}),
      });
      api.addRoute(route);
      //pre-check
      const response = await TestUtils.sendRequest(api, '/api', Method.GET);
      expect(response.status, 'Response errors should come with status 500').toBe(500);
      expect(response.body.error, 'Response validation errors come with code UnknownError').toBe(ErrorCode.UnknownError);
    });

    test('Responds with default error if no error handler present', async () => {
      const conf = new DefaultConfig();
      conf.onError = undefined;
      conf.skipDescriptionsCheck = true;
      const api = OpenApi.builder.create(SampleRouteType, ErrorCode, conf);
      const route = api.factory.createRoute({
        method: Method.GET,
        type: SampleRouteType.Public,
        path: '/',
        description: 'My test route',
        validators: {
          response: z.object({ok: z.boolean()}),
        },
        handler: async () => {
          throw new Error('Test');
        },
      });
      api.addRoute(route);
      //check
      const response = await TestUtils.sendRequest(api, '/api', Method.GET);
      expect(response.status, 'Default default error has status 500').toBe(500);
      expect(response.body.error, 'Default default error is UnknownError').toBe(ErrorCode.UnknownError);
    });

    test('Responds with default error if there is error in error handler', async () => {
      const conf = new DefaultConfig();
      conf.onError = () => {
        throw new Error('Something went wrong');
      };
      conf.skipDescriptionsCheck = true;
      const api = OpenApi.builder.create(SampleRouteType, ErrorCode, conf);
      const route = api.factory.createRoute({
        method: Method.GET,
        type: SampleRouteType.Public,
        path: '/',
        description: 'My test route',
        validators: {
          response: z.object({ok: z.boolean()}),
        },
        handler: async () => {
          throw new Error('Test');
        },
      });
      api.addRoute(route);
      //check
      const response = await TestUtils.sendRequest(api, '/api', Method.GET);
      expect(response.status, 'Default default error has status 500').toBe(500);
      expect(response.body.error, 'Default default error is UnknownError').toBe(ErrorCode.UnknownError);
    });

    test('Responds with default error if error handler responded with unregistered error', async () => {
      const conf = new DefaultConfig();
      conf.onError = () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return {code: ErrorCode.UnknownError, body: 'Something'} as any;
      };
      conf.skipDescriptionsCheck = true;
      const api = OpenApi.builder.create(SampleRouteType, ErrorCode, conf);
      const route = api.factory.createRoute({
        method: Method.GET,
        type: SampleRouteType.Public,
        path: '/',
        description: 'My test route',
        validators: {
          response: z.object({ok: z.boolean()}),
        },
        handler: async () => {
          throw new Error('Test');
        },
      });
      api.addRoute(route);
      //check
      const response = await TestUtils.sendRequest(api, '/api', Method.GET);
      expect(response.status, 'Default default error has status 500').toBe(500);
      expect(response.body.error, 'Default default error is UnknownError').toBe(ErrorCode.UnknownError);
    });

    test('Can have undefined response', async () => {
      const api = OpenApi.builder.defineGlobalConfig({
        basePath: '/api',
        skipDescriptionsCheck: true,
      }).create();
      const route = api.factory.createRoute({
        method: Method.GET,
        type: SampleRouteType.Public,
        path: '/',
        description: 'My test route',
        validators: {
          response: undefined,
        },
        handler: async () => undefined,
      });
      api.addRoute(route);
      //pre-check
      const response = await TestUtils.sendRequest(api, '/api', Method.GET);
      expect(response.status, 'Response errors should come with status 200').toBe(200);
      expect(response.body, 'Response body should be undefined').toBe(undefined);
    });

    test('Response validation can be disabled', async () => {
      const api = OpenApi.builder.defineGlobalConfig({
        basePath: '/api',
        skipDescriptionsCheck: true,
        disableResponseValidation: true,
      }).create();
      const route = api.factory.createRoute({
        method: Method.GET,
        type: SampleRouteType.Public,
        path: '/',
        description: 'My test route',
        validators: {
          response: z.object({ok: z.boolean()}),
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handler: async () => 1 as any,
      });
      api.addRoute(route);
      //pre-check
      const response = await TestUtils.sendRequest(api, '/api', Method.GET);
      expect(response.status, 'Response errors should come with status 200').toBe(200);
      expect(response.body, 'Response body should be undefined').toBe(1);
    });

  });
});
