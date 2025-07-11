import {describe, expect, test} from 'vitest';
import {ErrorCode} from '../../enums/ErrorCode';
import z, {TypeOf} from 'zod';
import {ErrorConfigMap} from '../../types/config/ErrorConfigMap';
import {OpenApi} from '../../OpenApi';
import {Method} from '../../enums/Methods';
import {SampleRouteType} from '../../enums/SampleRouteType';
import {TestUtils} from '../TestUtils/TestUtils';
import {RouteConfig} from '../../types/config/RouteConfig';
import {RoutePath} from '../../types/RoutePath';
import {AnyConfig} from '../../types/config/AnyConfig';
import {AnyRouteConfigMap} from '../../types/config/AnyRouteConfigMap';
describe('ConfigBuilder', () => {

  enum MyRouteTypes {
      Public = 'Public',
      User = 'User',
  }

  test('Can be created without config', async () => {
    const defaultApi = OpenApi.builder.create();
    const route = defaultApi.factory.createRoute({
      type: SampleRouteType.Public,
      method: Method.GET,
      path: '/route',
      description: 'Test route',
      validators: {
        response: z.string().openapi({description: 'Test response'}),
      },
      handler: () => Promise.resolve('success'),
    });
    defaultApi.addRoute(route);
    // check
    const req = TestUtils.createRequest('/api/something');
    const res = await defaultApi.processRootRoute(req);
    expect(res.body, 'Should throw error since no route is present').toEqual({
      error: ErrorCode.NotFound,
    });
    const req2 = TestUtils.createRequest('/api/route');
    const res2 = await defaultApi.processRootRoute(req2);
    expect(res2.body, 'Should be able to respond correctly').toEqual('success');
  });

  test('Can be created with only configuring globals', async () => {
    const defaultApi = OpenApi.builder.defineGlobalConfig({
      basePath: '/non-default-placement',
    }).create();
    const route = defaultApi.factory.createRoute({
      type: SampleRouteType.Public,
      method: Method.GET,
      path: '/route',
      description: 'Test route',
      validators: {
        response: z.string().openapi({description: 'Test response'}),
      },
      handler: () => Promise.resolve('success'),
    });
    defaultApi.addRoute(route);

    // check
    const req = TestUtils.createRequest('/api/route');
    const res = await defaultApi.processRootRoute(req);
    expect(res.body, 'Should have bad response on default base path').toEqual({
      error: ErrorCode.NotFound,
    });

    const req2 = TestUtils.createRequest('/non-default-placement/route');
    const res2 = await defaultApi.processRootRoute(req2);
    expect(res2.body, 'Should be able to respond on custom base path').toEqual('success');
  });

  test('Works Well with inferred config', async () => {
    const api3 = OpenApi.builder.customizeErrors(
      ErrorCode
    ).defineErrors({
      [ErrorCode.UnknownError]: {
        status: '500',
        description: 'Unkwown Error',
        responseValidator: z.object({
          error: z.object({
            code: z.literal(ErrorCode.UnknownError),
          }),
        }),
      },
      [ErrorCode.ValidationFailed]: {
        status: '400',
        description: 'Validation Failed',
        responseValidator: z.object({
          error: z.object({
            code: z.literal(ErrorCode.ValidationFailed),
          }),
        }),
      },
      [ErrorCode.NotFound]: {
        status: '404',
        description: 'Route Not Found',
        responseValidator: z.object({
          error: z.object({
            code: z.literal(ErrorCode.NotFound),
          }),
        }),
      },
    }).defineDefaultError({
      code: ErrorCode.UnknownError,
      body: {error: {code: ErrorCode.UnknownError}},
    }).customizeRoutes(
      SampleRouteType
    ).defineRouteExtraParams({
      [SampleRouteType.Public]: z.object({routeParam: z.string()}),
    }).defineRouteContexts({
      [SampleRouteType.Public]: (ctx) => Promise.resolve({contextParam: ctx.route.routeParam}),
    }).defineRoutes({
      [SampleRouteType.Public]: {
        authorization: false,
        errors: {
          ValidationFailed: true,
        },
      },
    }).defineGlobalConfig({
      basePath: '/api',
      skipDescriptionsCheck: true,
      handleError: () => {
        throw new Error('Function not implemented.');
      },
    }).create();

    const route = api3.factory.createRoute({
      type: SampleRouteType.Public,
      method: Method.GET,
      path: '/test',
      description: 'Test Route',
      validators: {
        response: z.string(),
      },
      handler: (ctx) => Promise.resolve(ctx.contextParam),
      routeParam: 'myRouteParam',
    });
    api3.addRoutes('/', [route]);
    const req = TestUtils.createRequest('/api/test', Method.GET);
    const res = await api3.processRootRoute(req);
    expect(res.status).toBe(200);
    expect(res.body).toBe('myRouteParam');
  });

  test('Works Well with class-based config', async () => {
    const userRouteExtraPropsvalidator = z.object({
      permission: z.string(),
    });
    type UserRouteContextValidator = typeof userRouteExtraPropsvalidator
    type UserRouteContext = TypeOf<UserRouteContextValidator>
    class AppErrorConfig implements ErrorConfigMap<ErrorCode> {
      [ErrorCode.UnknownError] = {
        status: '500',
        description: 'Unkwown Error',
        responseValidator: z.object({
          error: z.object({
            code: z.literal(ErrorCode.UnknownError),
          }),
        }),
      } as const;
      [ErrorCode.ValidationFailed] = {
        status: '400',
        description: 'Validation Failed',
        responseValidator: z.object({
          error: z.object({
            code: z.literal(ErrorCode.ValidationFailed),
          }),
        }),
      }as const;
      [ErrorCode.NotFound] = {
        status: '404',
        description: 'Route Not Found',
        responseValidator: z.object({
          error: z.object({
            code: z.literal(ErrorCode.NotFound),
          }),
        }),
      }as const;
    }

    class AppRouteConfig implements AnyRouteConfigMap<MyRouteTypes, ErrorCode> {
      Public: RouteConfig<MyRouteTypes.Public, ErrorCode, undefined, undefined> = {
        authorization: false,
        extraProps: undefined,
        contextFactory: async () => (undefined),
      };
      User: RouteConfig<MyRouteTypes.User, ErrorCode, UserRouteContextValidator, UserRouteContext> = {
        authorization: false,
        contextFactory: async (ctx) => ({permission: ctx.route.permission}),
        extraProps: userRouteExtraPropsvalidator,
        // context: userRouteExtraPropsvalidator,
      };
    }

    class AppConfig implements AnyConfig<MyRouteTypes, ErrorCode> {
      basePath: RoutePath = '/api';
      routes = new AppRouteConfig();
      errors = new AppErrorConfig();
      defaultError = {
        code: ErrorCode.UnknownError,
        body: {
          error: {
            code: ErrorCode.UnknownError,
          },
        },
      } as const;
      handleError() {
        return this.defaultError;
      };
    }
    const api = OpenApi.builder.create(MyRouteTypes, ErrorCode, new AppConfig());
    const route = api.factory.createRoute({
      type: MyRouteTypes.User,
      method: Method.GET,
      path: '/',
      description: 'Test route',
      validators: {
        response: z.string().openapi({description: 'Test response'}),
      },
      handler: (ctx) => Promise.resolve(ctx.permission),
      permission: 'My Test Permission',
    });

    api.addRoutes('/', [route]);
    const req = TestUtils.createRequest('/api', Method.GET);
    const res = await api.processRootRoute(req);
    expect(res.status).toBe(200);
    expect(res.body).toBe('My Test Permission');
  });
});
