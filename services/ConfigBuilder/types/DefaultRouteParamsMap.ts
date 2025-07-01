import z from 'zod';
import {SampleRouteType} from '../../../enums/SampleRouteType';
import {RouteValidatorMap} from '../../../types/config/RouteValidatorMap';

export class DefaultRouteParamsMap implements RouteValidatorMap<SampleRouteType> {
  Public = z.object({});
}
