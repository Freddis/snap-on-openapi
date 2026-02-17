import {AnyConfig} from './AnyConfig';

export type RouteContext<
TRouteType extends string,
TConfig extends AnyConfig<TRouteType, string>
> = Awaited<ReturnType<TConfig['routes'][TRouteType]['contextFactory']>>
