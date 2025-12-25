import {Logger} from '../../services/Logger/Logger';
import {OnResponseEvent} from './OnResponseEvent';

export interface OnErrorEvent extends Partial<OnResponseEvent> {
  request: Request;
  logger: Logger;
  error: unknown;
}
