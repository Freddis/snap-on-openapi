import {ZodObject, ZodRawShape} from 'zod';
import {RouteExtraPropsMap} from './RouteExtraPropsMap';
import {ContextParams} from './ContextParams';

export type RouteContextMap<
  TCode extends string,
  TParamsMap extends RouteExtraPropsMap<TCode, ZodObject<ZodRawShape> | undefined> | undefined,
> = {
  [key in TCode]: (
    params: ContextParams<key, TParamsMap extends undefined ? undefined : Exclude<TParamsMap, undefined>[key]>
  ) => Promise<object>
}
