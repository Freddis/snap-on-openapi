/* eslint-disable no-empty-function */
import {describe, expect, test} from 'vitest';
import express from 'express';
import supertest from 'supertest';
import {TestUtils} from '../TestUtils/TestUtils';
import {ErrorCode} from '../../enums/ErrorCode';
import {ExpressApp} from './types/ExpressApp';
import {ExpressHandler} from './types/ExpressHandler';
import {ExpressRequest} from './types/ExpressRequest';
import {ExpressResponse} from './types/ExpressResponse';
import z from 'zod';
import {Method} from '../../enums/Methods';
import {SampleRouteType} from '../../enums/SampleRouteType';
import {OpenApi} from '../../OpenApi';

describe('ExpressWrapper', () => {


  test('Can mount the api correctly', async () => {
    const api = TestUtils.createOpenApi();
    const app = express();
    api.wrappers.express.createOpenApiRootRoute(app);

    // checking
    const errResponse = await supertest(app).get('/api');
    expect(errResponse.status, 'Should be 404 on unknown route').toBe(404);
    expect(errResponse.body, 'Should be error on unknown route').toEqual({error: ErrorCode.NotFound});
    const goodResponse = await supertest(app).get('/api/sample');
    expect(goodResponse.status, 'Should be 200 on sample route').toBe(200);
    expect(goodResponse.body, "Should be body 'success'").toEqual('success');
  });

  test('Can mount swagger routes correctly', async () => {
    const api = TestUtils.createOpenApi();
    const app = express();
    api.wrappers.express.createSwaggerRoute('/swagger', app);

    // checking
    const goodResponse = await supertest(app).get('/swagger');
    expect(goodResponse.status, 'Should be 200 on swagger route').toBe(200);
    expect(goodResponse.text, 'Swagger UI pieces should be in HTML').toContain('swagger-ui');
    expect(goodResponse.text, 'Default schema path should be present').toContain('/openapi-schema');
  });

  test('Can mount stoplight routes correctly', async () => {
    const api = TestUtils.createOpenApi();
    const app = express();
    api.wrappers.express.createStoplightRoute('/light', app);
    // checking
    const goodResponse = await supertest(app).get('/light');
    expect(goodResponse.status, 'Should be 200 on stoplight route').toBe(200);
    expect(goodResponse.text, 'Stoplight UI pieces should be in HTML').toContain('@stoplight');
    expect(goodResponse.text, 'Default schema path should be present').toContain('/openapi-schema');
  });

  test('Can mount schema routes correctly', async () => {
    const api = TestUtils.createOpenApi();
    const app = express();
    api.wrappers.express.createSchemaRoute('/schema', app);

    // checking
    const goodResponse = await supertest(app).get('/schema');
    expect(goodResponse.status, 'Should be 200 on schema route').toBe(200);
    expect(goodResponse.text, 'Response should contain pieces of openapi schema').toContain('Sample route');
  });

  test('Can mount stoplight routes correctly', async () => {
    const api = TestUtils.createOpenApi();
    const app = express();
    api.wrappers.express.createStoplightRoute('/light', app);


    // checking
    const goodResponse = await supertest(app).get('/light');
    expect(goodResponse.status, 'Should be 200 on stoplight route').toBe(200);
    expect(goodResponse.text, 'Stoplight UI pieces should be in HTML').toContain('@stoplight');
    expect(goodResponse.text, 'Default schema path should be present').toContain('/openapi-schema');
  });

  test('Works correctly with array header values', async () => {
    // that's why you shouldn't go fo 100% coverage
    // this test is absolutely retarded testing something that doesn't happen in reality
    // and comes from a rookie conflict of early node types with @types/express
    // funnily enough this also produces a tiny bit of dead code in production
    // tl;dr: there cannot be any string[] value for a specific header
    class ExpressAppMock implements ExpressApp {
      handler?: ExpressHandler;
      post(route: string | RegExp, handler: ExpressHandler): void {
        this.handler = handler;
      };
      get = () => {};
      delete = () => {};
      put = () => {};
      patch = () => {};

      async test(req: ExpressRequest): Promise<{status: number, body: unknown}> {
        let body: unknown;
        let status: number = 0;
        const res: ExpressResponse = {
          header: function(): ExpressResponse {
            return this;
          },
          status: function(code: number): ExpressResponse {
            status = code;
            return this;
          },
          json: function(data: unknown): ExpressResponse {
            body = data;
            return this;
          },
          send: function(): ExpressResponse {
            return this;
          },
        };
        if (!this.handler) {
          throw new Error("Handler wasn't set");
        }
        await this.handler(req, res);
        return {status, body};
      }
    };
    const appMock = new ExpressAppMock();

    const api = OpenApi.builder
    .customizeRoutes(
      SampleRouteType
    )
    .defineRouteContexts({
      [SampleRouteType.Public]: (ctx) => Promise.resolve({
        authorization: ctx.request.headers.get('Authorization'),
      }),
    })
    .defineRoutes({
      [SampleRouteType.Public]: {
        authorization: true,
      },
    })
    .create();
    // const x = api.getConfig().routes.Public.context;
    api.wrappers.express.createOpenApiRootRoute(appMock);
    const route = api.factory.createRoute({
      type: SampleRouteType.Public,
      method: Method.POST,
      path: '/test-multi-headers',
      description: 'Multiheader test route',
      validators: {
        response: z.unknown().nullable().openapi({description: 'Authorization header'}),
      },
      handler: (ctx) => Promise.resolve(ctx.authorization),
    });

    api.addRoute(route);
    // checking
    const req: ExpressRequest = {
      headers: {
        Authorization: ['Bearer1', 'Bearer2'],
        ContentType: undefined,
      },
      body: '',
      method: 'POST',
      protocol: '',
      originalUrl: '/api/test-multi-headers',
      host: 'http://localhost',
    };
    const goodResponse = await appMock.test(req);
    expect(goodResponse.status, 'Should be 200 on sample route').toBe(200);
    expect(goodResponse.body, 'Route should return both headers').toBe('Bearer1,Bearer2');
  });

});
