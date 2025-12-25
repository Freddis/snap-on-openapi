import {AnyRoute} from '../AnyRoute';
import {OnRequestEvent} from './OnRequestEvent';

export interface OnRouteEvent extends OnRequestEvent {
  path: string;
  method: string;
  params: Record<string, string>;
  query: Record<string, string | string[]>;
  body: unknown;
  route: AnyRoute<string>;
}

