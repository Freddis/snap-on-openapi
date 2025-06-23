import {z} from 'zod';
import {OpenApiErrorConfigMap} from './OpenApiErrorConfigMap';

export type OpenApiErrorResponse<
  TErrorConfigMap extends OpenApiErrorConfigMap<string>,
> = z.TypeOf<TErrorConfigMap[keyof TErrorConfigMap]['validator']>
