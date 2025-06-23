export type RouteExtraPropsMap<TRouteType extends string> ={
  [key in TRouteType]: object;
}
