import {ExpressHandler} from './ExpressHandler';

export interface ExpressApp {
  get: (route: string, handler: ExpressHandler) => void
  post: (route: string, handler: ExpressHandler) => void
  delete: (route: string, handler: ExpressHandler) => void
  put: (route: string, handler: ExpressHandler) => void
  patch: (route: string, handler: ExpressHandler) => void
}
