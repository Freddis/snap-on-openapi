import {describe, expect, test} from 'vitest';
import {ValidationUtils} from './ValidationUtils';
import {OpenApi} from '../..';
import z, {} from 'zod';
import {SampleRouteType} from '../../enums/SampleRouteType';
import {Methods} from '../../enums/Methods';
import {TestUtils} from '../TestUtils/TestUtils';
import {PaginatedResponse} from './types/PaginatedResponse';

describe('ValidationUtils', () => {
  const utils = new ValidationUtils();
  const api = OpenApi.builder.defineGlobalConfig({
    basePath: '/api',
    skipDescriptionsCheck: true,
  }).create();

  describe('Transformers', () => {

    test('Correctly parses numbers from query', async () => {
      const route = api.factory.createRoute({
        type: SampleRouteType.Public,
        method: Methods.GET,
        path: '/number',
        description: 'Some description',
        validators: {
          query: z.object({
            number: utils.query.transformers.number.openapi({description: 'test'}),
          }).openapi({description: 'response'}),
          response: z.number().openapi({description: 'test'}),
        },
        handler: (ctx) => Promise.resolve(ctx.params.query.number),
      });

      api.addRoute(route);
      const req = TestUtils.createRequest('/api/number?number=10');
      const res = await api.processRootRoute(req);
      expect(res.status).toBe(200);
      expect(res.body).toBe(10);
    });

    test('Correctly parses Dates from query', async () => {
      const route = api.factory.createRoute({
        type: SampleRouteType.Public,
        method: Methods.GET,
        path: '/date',
        description: 'Some description',
        validators: {
          query: z.object({
            date: utils.query.transformers.datetime.openapi({description: 'test'}),
          }).openapi({description: 'response'}),
          response: z.date().openapi({description: 'test'}),
        },
        handler: (ctx) => Promise.resolve(ctx.params.query.date),
      });

      api.addRoute(route);
      const req = TestUtils.createRequest('/api/date?date=2025-07-03T08:28:26.268Z');
      const res = await api.processRootRoute(req);
      expect(res.status).toBe(200);
      expect(z.date().safeParse(res.body).data?.toISOString()).toBe('2025-07-03T08:28:26.268Z');
    });

  });

  describe('Validators', () => {
    test('Paginated Query', async () => {
      const route = api.factory.createRoute({
        type: SampleRouteType.Public,
        method: Methods.GET,
        path: '/paginatedQuery',
        description: 'Some description',
        validators: {
          query: utils.query.validators.paginatedQuery({
            name: z.string(),
            date: utils.query.transformers.datetime,
          }),
          response: z.object({
            name: z.string(),
            date: z.date(),
            page: z.number().optional(),
            pageSize: z.number().optional(),
          }).openapi({description: 'test'}),
        },
        handler: (ctx) => Promise.resolve(ctx.params.query),
      });
      api.addRoute(route);
      const req = TestUtils.createRequest('/api/paginatedQuery?name=hello&date=2025-07-03T08:28:26.268Z');
      const res = await api.processRootRoute(req);
      expect(res.status).toBe(200);
      expect(res.body).toStrictEqual({
        page: 1,
        name: 'hello',
        date: new Date('2025-07-03T08:28:26.268Z'),
      });
    });

    test('Paginated Response', async () => {
      const route = api.factory.createRoute({
        type: SampleRouteType.Public,
        method: Methods.GET,
        path: '/paginatedResponse',
        description: 'Some description',
        validators: {
          response: utils.response.validators.paginatedResponse(z.object({
            name: z.string(),
          })),
        },
        handler: async () => {
          const res: PaginatedResponse<{name: string}> = {
            items: [{name: 'John'}, {name: 'Snow'}],
            info: {
              count: 1000,
              page: 10,
              pageSize: 15,
            },
          };
          return res;
        },
      });
      api.addRoute(route);
      const req = TestUtils.createRequest('/api/paginatedResponse');
      const res = await api.processRootRoute(req);
      expect(res.status).toBe(200);
      expect(res.body).toStrictEqual({
        items: [{name: 'John'}, {name: 'Snow'}],
        info: {
          count: 1000,
          page: 10,
          pageSize: 15,
        },
      });
    });

  });

});
