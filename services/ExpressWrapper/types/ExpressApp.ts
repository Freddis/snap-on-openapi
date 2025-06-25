import {ExpressHandler} from './ExpressHandler';

export interface ExpressApp {
  get: (route: string | RegExp, handler: ExpressHandler) => void
  post: (route: string | RegExp, handler: ExpressHandler) => void
  delete: (route: string | RegExp, handler: ExpressHandler) => void
  put: (route: string | RegExp, handler: ExpressHandler) => void
  patch: (route: string | RegExp, handler: ExpressHandler) => void
}
