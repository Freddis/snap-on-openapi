import {AnyRoute} from '../AnyRoute';
import {RouteExtraProps} from '../config/RouteExtraProps';
import {RouteExtraPropsMap} from '../config/RouteExtraPropsMap';
import {OnRequestEvent} from './OnRequestEvent';

export interface OnRouteEvent<
  TRouteType extends string,
  TExtraPropsMap extends RouteExtraPropsMap<TRouteType>,
> extends OnRequestEvent {
  path: string;
  method: string;
  params: Record<string, string>;
  query: Record<string, string | string[]>;
  body: unknown;
  route: AnyRoute<TRouteType> & RouteExtraProps<TExtraPropsMap[TRouteType]>
}

