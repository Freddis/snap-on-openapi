import {OpenApi} from '../../OpenApi';
import {Methods} from '../../enums/Methods';
import {RoutePath} from '../../types/RoutePath';

export class TestUtils {
  static createRequest(route: RoutePath, method: Methods = Methods.GET): Request {
    const request = new Request(`http://localhost${route}`, {
      method: method,
    });
    return request;
  }

  static createOpenApi() {
    return OpenApi.builder.create();
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
