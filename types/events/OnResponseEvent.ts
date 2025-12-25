import {RouteResponse} from '../RouteResponse';
import {OnHandlerEvent} from './OnHandlerEvent';
export interface OnResponseEvent extends OnHandlerEvent {
  response: RouteResponse
}


