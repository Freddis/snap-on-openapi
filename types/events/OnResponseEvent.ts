import {OnHandlerEvent} from './OnHandlerEvent';

export interface OnResponseEvent extends OnHandlerEvent {
  response: {
    status: number;
    body: unknown;
    headers: Record<string, string>;
  }
}


