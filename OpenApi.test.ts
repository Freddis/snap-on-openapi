import {describe, expect, test} from 'vitest';
import {TestUtils} from './services/TestUtils/TestUtils';
import {OpenApiMethods} from './enums/OpenApiMethods';
import z from 'zod';
import {TestRoute} from './services/TestUtils/types/TestRoute';

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
});
