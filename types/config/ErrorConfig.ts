import {ZodObject, ZodRawShape} from 'zod';

export type ErrorConfig<T extends ZodObject<ZodRawShape>> = {
  status: `${1 | 2 | 3 | 4 | 5}${string}`;
  description: string;
  responseValidator: T;
}
