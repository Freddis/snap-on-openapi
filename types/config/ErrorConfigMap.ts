import {ZodObject, ZodRawShape} from 'zod';
import {ErrorConfig} from './ErrorConfig';

export type ErrorConfigMap<TEnum extends string, > = {
  [key in TEnum]: ErrorConfig<ZodObject<ZodRawShape>>
}
