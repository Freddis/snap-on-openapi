import {ZodObject, ZodRawShape, TypeOf} from 'zod';

export type RouteExtraProps<
TValidator extends ZodObject<ZodRawShape> | undefined
> = TValidator extends undefined ? object : TypeOf<Exclude<TValidator, undefined>>;
