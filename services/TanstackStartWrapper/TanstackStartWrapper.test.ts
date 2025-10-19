import {describe, expect, test} from 'vitest';
import {TestUtils} from '../TestUtils/TestUtils';
import {ErrorCode} from '../../enums/ErrorCode';
import {object, string} from 'zod';
import {SampleRouteType} from '../../enums/SampleRouteType';
import {Method} from '../../enums/Methods';
describe('TanstackStartWrapper', () => {

  test.skip('Can mount api on tanstack start', async () => {
    // cannot test it yet, filled out a ticket: https://github.com/TanStack/router/issues/4602
    // todo: write proper integrational tests when Tanstack Start updates
  });

  describe('unit', () => {
    test('Can mount the api correctly', async () => {
      const api = TestUtils.createOpenApi();
      const methods = api.wrappers.tanstackStart.getOpenApiRootMethods();

    // checking
      const errResponse = await methods.GET({request: TestUtils.createRequest('/api')});
      expect(errResponse.status, 'Should be 404 on unknown route').toBe(404);

      expect(await errResponse.json(), 'Should be error on unknown route').toEqual({error: ErrorCode.NotFound});
      const goodResponse = await methods.GET({request: TestUtils.createRequest('/sample')});
      expect(goodResponse.status, 'Should be 200 on sample route').toBe(200);
      expect(await goodResponse.json(), "Should be body 'success'").toEqual('success');
    });

    test('Can process headers', async () => {
      const api = TestUtils.createOpenApi();
      const route = api.factory.createRoute({
        method: Method.GET,
        type: SampleRouteType.Public,
        path: '/test-headers',
        description: 'My test route',
        validators: {
          response: string().openapi({description: 'response'}),
          responseHeaders: object({
            'X-Test': string().openapi({description: 'Testing Header'}),
          }),
        },
        handler: () => Promise.resolve({
          body: 'success',
          headers: {
            'X-Test': 'Test header',
          },
        }),
      });
      api.addRoute(route);
      const methods = api.wrappers.tanstackStart.getOpenApiRootMethods();
      const goodResponse = await methods.GET({request: TestUtils.createRequest('/test-headers')});
      expect(goodResponse.status, 'Should be 200 on sample route').toBe(200);
      expect(goodResponse.headers.get('X-Test'), 'Should contain test header').toEqual('Test header');
    });

    test('Can mount swagger routes correctly', async () => {
      const api = TestUtils.createOpenApi();
      const methods = api.wrappers.tanstackStart.createSwaggerMethods('/openapi-schema');

      // checking
      const goodResponse = await methods.GET();
      expect(goodResponse.status, 'Should be 200 on swagger route').toBe(200);
      const body = await goodResponse.text();
      expect(body, 'Swagger UI pieces should be in HTML').toContain('swagger-ui');
      expect(body, 'Default schema path should be present').toContain('/openapi-schema');
    });

    test('Can mount stoplight routes correctly', async () => {
      const api = TestUtils.createOpenApi();
      const methods = api.wrappers.tanstackStart.createStoplightMethods('/openapi-schema');

    // checking
      const goodResponse = await methods.GET();
      expect(goodResponse.status, 'Should be 200 on stoplight route').toBe(200);
      const body = await goodResponse.text();
      expect(body, 'Stoplight UI pieces should be in HTML').toContain('@stoplight');
      expect(body, 'Default schema path should be present').toContain('/openapi-schema');
    });

    test('Can mount schema routes correctly', async () => {
      const api = TestUtils.createOpenApi();
      const methods = api.wrappers.tanstackStart.createShemaMethods();

     // checking
      const goodResponse = await methods.GET();
      expect(goodResponse.status, 'Should be 200 on schema route').toBe(200);
      expect(await goodResponse.text(), 'Response should contain pieces of openapi schema').toContain('Sample route');
    });

  });
});
