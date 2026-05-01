import {RouteContextMap} from '../config/RouteContextMap';
import {RouteExtraPropsMap} from '../config/RouteExtraPropsMap';
import {OnRouteEventData} from './OnRouteEventData';

export interface OnHandlerEventData<
TRouteType extends string,
TExtraPropsMap extends RouteExtraPropsMap<TRouteType>,
TContext extends RouteContextMap<TRouteType, TExtraPropsMap>
> extends OnRouteEventData<TRouteType, TExtraPropsMap> {
  validated: {
    query: Record<string, unknown>;
    path: Record<string, unknown>;
    body: unknown;
  }
  context: Awaited<ReturnType<TContext[TRouteType]>>
}
