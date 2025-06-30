import {ZodObject, ZodRawShape} from 'zod';

export type RouteValidatorMap<
  TCode extends string,
  TVal extends ZodObject<ZodRawShape> = ZodObject<ZodRawShape>
> = {
  [key in TCode]: TVal
}
