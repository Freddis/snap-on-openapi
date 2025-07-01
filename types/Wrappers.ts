import {ExpressWrapper} from '../services/ExpressWrapper/ExpressWrapper';
import {TanstackStartWrapper} from '../services/TanstackStartWrapper/TanstackStartWrapper';
import {AnyConfig} from './config/AnyConfig';

export interface Wrappers<
  TRouteTypes extends string,
  TErrorCodes extends string,
  TConfig extends AnyConfig<TRouteTypes, TErrorCodes>
> {
  tanstackStart: TanstackStartWrapper<TRouteTypes, TErrorCodes, TConfig>
  express: ExpressWrapper<TRouteTypes, TErrorCodes, TConfig>
}
