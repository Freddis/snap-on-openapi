import {OpenApiRoute} from './OpenApiRoute';

export interface OpenApiRouteMapRow<TRouteType extends string> {
  path: string,
  routes: OpenApiRoute<TRouteType>[]
}
