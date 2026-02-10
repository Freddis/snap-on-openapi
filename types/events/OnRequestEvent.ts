import {ILogger} from '../../services/Logger/types/ILogger';

export interface OnRequestEvent {
  request: Request;
  logger: ILogger;
}
