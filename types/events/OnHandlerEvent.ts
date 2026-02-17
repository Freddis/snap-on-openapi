import {RouteExtraPropsMap} from '../config/RouteExtraPropsMap';
import {OnRouteEvent} from './OnRouteEvent';
export interface OnHandlerEvent<
TRouteType extends string,
TContextMap extends RouteExtraPropsMap<TRouteType>,
TContext extends object
> extends OnRouteEvent<TRouteType, TContextMap> {
  validated: {
    query: Record<string, unknown>;
    path: Record<string, unknown>;
    body: unknown;
  }
  context: TContext
}
