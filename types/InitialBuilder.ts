import {ErrorCode} from '../enums/ErrorCode';
import {SampleRouteType} from '../enums/SampleRouteType';
import {ConfigBuilder} from '../services/ConfigHelper/ConfigBuilder';
import {DefaultConfig} from '../services/ConfigHelper/types/DefaultConfig';
import {DefaultErrorMap} from '../services/ConfigHelper/types/DefaultErrorMap';
import {DefaultRouteContextMap} from '../services/ConfigHelper/types/DefaultRouteContextMap';
import {DefaultRouteMap} from '../services/ConfigHelper/types/DefaultRouteMap';
import {DefaultRouteParamsMap} from '../services/ConfigHelper/types/DefaultRouteParamsMap';

export type InitialBuilder = Pick<
  ConfigBuilder<
    SampleRouteType,
    ErrorCode,
    DefaultErrorMap,
    DefaultRouteParamsMap,
    DefaultRouteContextMap,
    DefaultRouteMap,
    DefaultConfig
  >,
  'customizeErrors' |'create' | 'defineGlobalConfig' | 'customizeRoutes'
>
