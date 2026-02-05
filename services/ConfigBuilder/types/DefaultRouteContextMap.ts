import {SampleRouteType} from '../../../enums/SampleRouteType';
import {RouteContextMap} from '../../../types/config/RouteContextMap';
import {DefaultRouteParamsMap} from './DefaultRouteParamsMap';

export class DefaultRouteContextMap implements RouteContextMap<SampleRouteType, DefaultRouteParamsMap> {
  Public = async () => ({});
}
