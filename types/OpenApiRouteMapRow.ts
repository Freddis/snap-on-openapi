import {AnyRoute} from './AnyRoute';

export interface OpenApiRouteMapRow<TRouteType extends string> {
  path: string,
  routes: AnyRoute<TRouteType>[]
}
