import {ZodObject, ZodRawShape} from 'zod';
import {OpenApiErrorConfig} from './OpenApiErrorConfig';

export type OpenApiErrorConfigMap<TEnum extends string, > = {
  [key in TEnum]: OpenApiErrorConfig<ZodObject<ZodRawShape>>
}
