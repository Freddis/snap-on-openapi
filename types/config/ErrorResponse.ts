import {z} from 'zod';
import {ErrorConfigMap} from './ErrorConfigMap';

export type ErrorResponse<
  TErrorConfigMap extends ErrorConfigMap<string>,
> = z.TypeOf<TErrorConfigMap[keyof TErrorConfigMap]['validator']>
