import {AnyRoute} from './AnyRoute';
import {RoutePath} from './RoutePath';

export type RouteMap<TRouteType extends string> = Record<RoutePath, AnyRoute<TRouteType>[]>
