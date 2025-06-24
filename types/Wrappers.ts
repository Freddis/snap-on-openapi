import {ExpressWrapper} from '../services/ExpressWrapper/ExpressWrapper';
import {TanstackStartWrapper} from '../services/TanstackStartWrapper/TanstackStartWrapper';
import {Config} from './config/Config';

export interface Wrappers<
  TRouteTypes extends Record<string, string>,
  TErrorCodes extends Record<string, string>,
  TConfig extends Config<TRouteTypes, TErrorCodes>
> {
  tanstackStart: TanstackStartWrapper<TRouteTypes, TErrorCodes, TConfig>
  express: ExpressWrapper<TRouteTypes, TErrorCodes, TConfig>
}
