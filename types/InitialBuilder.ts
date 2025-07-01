import {ErrorCode} from '../enums/ErrorCode';
import {SampleRouteType} from '../enums/SampleRouteType';
import {ConfigBuilder} from '../services/ConfigBuilder/ConfigBuilder';
import {DefaultConfig} from '../services/ConfigBuilder/types/DefaultConfig';
import {DefaultErrorMap} from '../services/ConfigBuilder/types/DefaultErrorMap';
import {DefaultRouteContextMap} from '../services/ConfigBuilder/types/DefaultRouteContextMap';
import {DefaultRouteMap} from '../services/ConfigBuilder/types/DefaultRouteMap';
import {DefaultRouteParamsMap} from '../services/ConfigBuilder/types/DefaultRouteParamsMap';

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
