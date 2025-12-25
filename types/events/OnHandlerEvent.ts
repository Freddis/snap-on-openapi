import {OnRouteEvent} from './OnRouteEvent';

export interface OnHandlerEvent extends OnRouteEvent {
  validated: {
    query: Record<string, unknown>;
    path: Record<string, unknown>;
    body: unknown;
  }
}
