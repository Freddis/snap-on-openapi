import {ZodObject, ZodRawShape, TypeOf} from 'zod';


export type RouteExtraProps<
TValidator extends ZodObject<ZodRawShape> | undefined,
TSwapVal = object
> = TValidator extends undefined ? TSwapVal : TypeOf<Exclude<TValidator, undefined>>;
