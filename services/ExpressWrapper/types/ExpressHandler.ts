import {ExpressRequest} from './ExpressRequest';
import {ExpressResponse} from './ExpressResponse';

export type ExpressHandler = (req: ExpressRequest, res: ExpressResponse) => void
