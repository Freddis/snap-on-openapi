import {ExpressWrapper} from '../services/ExpressWrapper/ExpressWrapper';
import {TanstackStartWrapper} from '../services/TanstackStartWrapper/TanstackStartWrapper';
import {Config} from './config/Config';

export interface Wrappers<
  TRouteTypes extends string,
  TErrorCodes extends string,
  TConfig extends Config<TRouteTypes, TErrorCodes>
> {
  tanstackStart: TanstackStartWrapper<TRouteTypes, TErrorCodes, TConfig>
  express: ExpressWrapper<TRouteTypes, TErrorCodes, TConfig>
}
