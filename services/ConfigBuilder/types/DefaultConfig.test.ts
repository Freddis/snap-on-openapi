import {describe, expect, test} from 'vitest';
import z from 'zod';
import {OpenApi} from '../../../OpenApi';
import {ErrorCode} from '../../../enums/ErrorCode';
import {Method} from '../../../enums/Methods';
import {SampleRouteType} from '../../../enums/SampleRouteType';
import {TestUtils} from '../../TestUtils/TestUtils';

describe('DefaultConfig', () => {

  describe('Error handler', () => {

    test('Returns not found error on unkown route', async () => {
      const defaultApi = OpenApi.builder.create();
      // check
      const req = TestUtils.createRequest('/api/route');
      const res = await defaultApi.processRootRoute(req);
      expect(res.body, 'Should throw error since no route is present').toEqual({
        error: ErrorCode.NotFound,
      });
      expect(res.status, 'Should status 404 for not found error').toEqual(404);
    });

    test('Returns unknown error on random error', async () => {
      const defaultApi = OpenApi.builder.create();
      const route = defaultApi.factory.createRoute({
        type: SampleRouteType.Public,
        method: Method.GET,
        path: '/route',
        description: 'Test route',
        validators: {
          response: z.string().openapi({description: 'Test response'}),
        },
        handler: async () => {
          throw new Error('dasdsaa');
        },
      });
      defaultApi.addRoute(route);

      // check
      const req = TestUtils.createRequest('/api/route');
      const res = await defaultApi.processRootRoute(req);
      expect(res.body, 'Should return unknown error if error happens').toEqual({
        error: ErrorCode.UnknownError,
      });
      expect(res.status, 'Should status 500 for unknown error').toEqual(500);
    });

    test('Returns validation error on invalid params', async () => {
      const defaultApi = OpenApi.builder.create();
      const route = defaultApi.factory.createRoute({
        type: SampleRouteType.Public,
        method: Method.POST,
        path: '/route',
        description: 'Test route',
        validators: {
          body: z.object({
            name: z.string().openapi({description: 'Name'}),
          }),
          response: z.string().openapi({description: 'Test response'}),
        },
        handler: async () => Promise.resolve('success'),
      });
      defaultApi.addRoute(route);

      // check
      const happyReq = TestUtils.createRequest('/api/route', Method.POST, {name: 'king'});
      const happyRes = await defaultApi.processRootRoute(happyReq);
      expect(happyRes.body, 'Should return normal response if body is valid').toBe('success');
      expect(happyRes.status, 'Should return status 200 on normal response').toBe(200);

      const req = TestUtils.createRequest('/api/route', Method.POST);
      const res = await defaultApi.processRootRoute(req);
      expect(res.body, 'Should return unknown error if error happens').toEqual({
        error: {
          code: ErrorCode.ValidationFailed,
          fieldErrors: [
            {
              field: 'name',
              message: 'Required',
            },
          ],
          location: 'Body',
        },
      });
      expect(res.status, 'Should return status 400 on validation error').toEqual(400);
    });

  });

});
