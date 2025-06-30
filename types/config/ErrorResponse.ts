import {TypeOf} from 'zod';
import {ErrorConfigMap} from './ErrorConfigMap';

export type ErrorResponse<TErrorCodes extends string, TErrorConfigMap extends ErrorConfigMap<TErrorCodes>> = {
  [K in TErrorCodes]: {
    code: K,
    body: TypeOf<TErrorConfigMap[K]['responseValidator']>
  }
}[TErrorCodes]
