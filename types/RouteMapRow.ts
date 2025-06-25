import {AnyRoute} from './AnyRoute';
import {RoutePath} from './RoutePath';

export interface RouteMapRow<TRouteType extends string> {
  path: RoutePath,
  routes: AnyRoute<TRouteType>[]
}
