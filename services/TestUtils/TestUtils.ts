import z from 'zod';
import {OpenApi} from '../../OpenApi';
import {TestRoute} from './types/TestRoute';
import {TestErrors} from './types/TestErrors';
import {Methods} from '../../enums/Methods';
import {RoutePath} from '../../types/RoutePath';

export class TestUtils {

  static createRequest(route: RoutePath, method: Methods): Request {
    const request = new Request(`http://localhost${route}`, {
      method: method,
    });
    return request;
  }

  static createOpenApi(routes: Record<string, string> = TestRoute, errors: Record<string, string> = TestErrors) {
    const api = OpenApi.create(routes, errors,
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
        basePath: '/api',
      });
    return api;
  }

  static async awaitGeneric<T>(timeoutMs: number, intervalMs: number, callback: () => Promise<T|null>) : Promise<T|null> {
    let now = new Date().getTime();
    const deadline = now + timeoutMs;
    let counter = 1;
    do {
      const left = (deadline - now) / 1000;
      // console.log(`Iteration ${counter++}: ${now} < ${deadline}`)
      console.log(`Iteration ${counter++}: ${left} sec. left`);
      const result = await callback();
      if (result !== null) {
        return result;
      }
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
      now = new Date().getTime();

    }
    while (now < deadline);
    return null;
  }
}
