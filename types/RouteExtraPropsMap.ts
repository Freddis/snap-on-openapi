import {ZodObject, ZodRawShape} from 'zod';

export type RouteExtraPropsMap<TRouteType extends string> ={
  [key in TRouteType]: ZodObject<ZodRawShape>;
}
