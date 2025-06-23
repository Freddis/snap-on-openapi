import {OpenApiRoute} from './OpenApiRoute';

export type ContextParams<TRouteType extends string> = {
  route: OpenApiRoute<TRouteType>
  request: Request,
  params: {
    body: unknown
    query: unknown
    path: unknown
  }
}
