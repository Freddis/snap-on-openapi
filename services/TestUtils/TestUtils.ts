import z from 'zod';
import {OpenApi} from '../../OpenApi';
import {Method} from '../../enums/Methods';
import {SampleRouteType} from '../../enums/SampleRouteType';
import {RoutePath} from '../../types/RoutePath';

export class TestUtils {
  static createRequest(route: RoutePath, method: Method = Method.GET, body?: object): Request {
    const request = new Request(`http://localhost${route}`, {
      method: method,
      body: JSON.stringify(body),
    });
    return request;
  }

  static createOpenApi() {
    const api = OpenApi.builder.create();
    const sampleRoute = api.factory.createRoute({
      type: SampleRouteType.Public,
      method: Method.GET,
      path: '/sample',
      description: 'Sample route',
      validators: {
        response: z.string().openapi({description: 'Sample response'}),
      },
      handler: () => Promise.resolve('success'),
    });
    api.addRoute(sampleRoute);
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
