import {Logger} from '../../services/Logger/Logger';

export interface OnRequestEvent {
  request: Request;
  logger: Logger;
}
