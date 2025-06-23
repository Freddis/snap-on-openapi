export type RouteContextMap<TRouteType extends string> = {
  [key in TRouteType]: object
}
