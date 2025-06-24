import {ZodObject, ZodRawShape, ZodFirstPartySchemaTypes} from 'zod';
import {Route} from './Route';

export type AnyRoute<TRouteType extends string> =
Route<
    TRouteType,
    object,
    ZodFirstPartySchemaTypes,
    ZodObject<ZodRawShape> | undefined,
    ZodObject<ZodRawShape> | undefined,
    ZodObject<ZodRawShape> | undefined
>
