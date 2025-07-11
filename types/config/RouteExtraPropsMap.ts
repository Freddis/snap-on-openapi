import {ZodObject, ZodRawShape} from 'zod';

export type RouteExtraPropsMap<
  TCode extends string,
  TVal extends ZodObject<ZodRawShape> | undefined = ZodObject<ZodRawShape> | undefined
> = {
  [key in TCode]: TVal
}
