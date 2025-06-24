import {AnyRoute} from './AnyRoute';

export type ContextParams<TRouteType extends string> = {
  route: AnyRoute<TRouteType>
  request: Request,
  params: {
    body: unknown
    query: unknown
    path: unknown
  }
}
