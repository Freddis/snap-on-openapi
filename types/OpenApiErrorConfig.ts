import {ZodObject, ZodRawShape} from 'zod';

export type OpenApiErrorConfig<T extends ZodObject<ZodRawShape>> = {
  status: `${1 | 2 | 3 | 4 | 5}${string}`;
  description: string;
  validator: T;
}
