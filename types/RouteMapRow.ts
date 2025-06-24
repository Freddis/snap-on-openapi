import {AnyRoute} from './AnyRoute';

export interface RouteMapRow<TRouteType extends string> {
  path: string,
  routes: AnyRoute<TRouteType>[]
}
