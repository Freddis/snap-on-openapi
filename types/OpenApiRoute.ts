import {ZodObject, ZodRawShape, ZodFirstPartySchemaTypes} from 'zod';
import {BaseOpenApiRoute} from './BaseOpenApiRoute';

export type OpenApiRoute<TRouteType extends string> =
BaseOpenApiRoute<
    TRouteType,
    object,
    ZodFirstPartySchemaTypes,
    ZodObject<ZodRawShape> | undefined,
    ZodObject<ZodRawShape> | undefined,
    ZodObject<ZodRawShape> | undefined
>
