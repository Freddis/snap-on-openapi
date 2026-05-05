import {ZodObject, ZodRawShape, ZodTypeAny} from 'zod';
import {Route} from './Route';

export type AnyRoute<TRouteType extends string> =
Route<
    TRouteType,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any,
    ZodTypeAny | undefined,
    ZodObject<ZodRawShape> | undefined,
    ZodObject<ZodRawShape> | undefined,
    ZodTypeAny | undefined,
    ZodObject<ZodRawShape> | undefined
>
