import {ZodObject, ZodRawShape, ZodFirstPartySchemaTypes} from 'zod';
import {Route} from './Route';

export type AnyRoute<TRouteType extends string> =
Route<
    TRouteType,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any,
    ZodFirstPartySchemaTypes,
    ZodObject<ZodRawShape> | undefined,
    ZodObject<ZodRawShape> | undefined,
    ZodObject<ZodRawShape> | undefined
>
