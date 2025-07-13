import {ErrorConfigMap} from '../../types/config/ErrorConfigMap';
import {Config} from '../../types/config/Config';
import {RouteConfigMap} from '../../types/config/RouteConfigMap';
import {OpenApi} from '../../OpenApi';
import {AnyConfig} from '../../types/config/AnyConfig';
import {DefaultConfig} from './types/DefaultConfig';
import {OpenApiConstructor} from './types/OpenApiConstructor';
import {OmitMappedField} from '../../types/config/OmitMappedField';
import {RouteExtraPropsMap} from '../../types/config/RouteExtraPropsMap';
import {ZodRawShape, ZodObject} from 'zod';
import {RouteContextMap} from '../../types/config/RouteContextMap';

export class ConfigBuilder<
  TRouteTypes extends string,
  TErrorCodes extends string,
  TErrorConfigMap extends ErrorConfigMap<TErrorCodes>,
  TRouteParamMap extends RouteExtraPropsMap<TRouteTypes, ZodObject<ZodRawShape> | undefined>,
  TRouteContextMap extends RouteContextMap<TRouteTypes, TRouteParamMap>,
  TRouteConfigMap extends RouteConfigMap<TRouteTypes, TErrorCodes, TRouteParamMap, TRouteContextMap>,
  TConfig extends Config<
    TRouteTypes,
    TErrorCodes,
    TErrorConfigMap,
    TRouteParamMap,
    TRouteContextMap,
    TRouteConfigMap
  > = Config<
    TRouteTypes,
    TErrorCodes,
    TErrorConfigMap,
    TRouteParamMap,
    TRouteContextMap,
    TRouteConfigMap
  >
> {
  protected x!: Config<
  TRouteTypes,
  TErrorCodes,
  ErrorConfigMap<TErrorCodes>,
  RouteExtraPropsMap<TRouteTypes>,
  RouteContextMap<TRouteTypes, RouteExtraPropsMap<TRouteTypes>>,
  RouteConfigMap<TRouteTypes, TErrorCodes, RouteExtraPropsMap<TRouteTypes>, RouteContextMap<TRouteTypes, RouteExtraPropsMap<TRouteTypes>>>
 >;
  protected construct: OpenApiConstructor;
  protected errorMap?: TErrorConfigMap;
  protected defaultError?: TConfig['defaultError'];
  protected routeMap?: TRouteConfigMap;
  protected routeParamMap?: TRouteParamMap;
  protected routeContextMap?: TRouteContextMap;
  protected conf?: Omit<TConfig, 'errors' | 'routes'|'defaultError'>;

  constructor(
    construct: OpenApiConstructor,
    errorMap?: TErrorConfigMap,
    defaultError?: TConfig['defaultError'],
    routeParamMap?: TRouteParamMap,
    routeContextMap?: TRouteContextMap,
    routeMap?: TRouteConfigMap,
    conf?: Omit<TConfig, 'errors' | 'routes'|'defaultError'>
  ) {
    this.construct = construct;
    this.errorMap = errorMap;
    this.defaultError = defaultError;
    this.routeParamMap = routeParamMap;
    this.routeContextMap = routeContextMap;
    this.routeMap = routeMap;
    this.conf = conf;
  }
  public customizeRoutes<T extends string>(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    routeTypes: Record<string, T>
  ): Pick<
    ConfigBuilder<
      T,
      TErrorCodes,
      TErrorConfigMap,
      RouteExtraPropsMap<T>,
      RouteContextMap<T, RouteExtraPropsMap<T>>,
      RouteConfigMap<T, TErrorCodes, RouteExtraPropsMap<T>, RouteContextMap<T, RouteExtraPropsMap<T>>>
    >,
    'defineRouteExtraProps' | 'defineRouteContexts' | 'defineRoutes'
  > {
    return new ConfigBuilder<
      T,
      TErrorCodes,
      TErrorConfigMap,
      RouteExtraPropsMap<T>,
      RouteContextMap<T, RouteExtraPropsMap<T>>,
      RouteConfigMap<T, TErrorCodes, RouteExtraPropsMap<T>, RouteContextMap<T, RouteExtraPropsMap<T>>>
    >(this.construct, this.errorMap, this.defaultError);
  }

  public customizeErrors<T extends string>(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    errorCodes: Record<string, T>
  ): Pick<
    ConfigBuilder<
      TRouteTypes,
      T,
      ErrorConfigMap<T>,
      RouteExtraPropsMap<TRouteTypes>,
      RouteContextMap<TRouteTypes, RouteExtraPropsMap<TRouteTypes>>,
      RouteConfigMap<
        TRouteTypes,
        T,
        RouteExtraPropsMap<TRouteTypes>,
        RouteContextMap<TRouteTypes, RouteExtraPropsMap<TRouteTypes>>
      >
    >,
    'defineErrors'
  > {
    return new ConfigBuilder<
      TRouteTypes,
      T,
      ErrorConfigMap<T>,
      RouteExtraPropsMap<TRouteTypes>,
      RouteContextMap<TRouteTypes, RouteExtraPropsMap<TRouteTypes>>,
      RouteConfigMap<
        TRouteTypes,
        T,
        RouteExtraPropsMap<TRouteTypes>,
        RouteContextMap<TRouteTypes, RouteExtraPropsMap<TRouteTypes>>
      >
    >(this.construct);
  }
  public defineErrors<T extends ErrorConfigMap<TErrorCodes>>(
    map: T
  ): Pick<
    ConfigBuilder<
      TRouteTypes,
      TErrorCodes,
      T,
      TRouteParamMap,
      TRouteContextMap,
      TRouteConfigMap
    >,
    'defineDefaultError'
  > {
    return new ConfigBuilder<
      TRouteTypes,
      TErrorCodes,
      T,
      TRouteParamMap,
      TRouteContextMap,
      TRouteConfigMap
    >(this.construct, map);
  }

  public defineDefaultError(
    defaultError: TConfig['defaultError']
  ): Pick<
    ConfigBuilder<
      TRouteTypes,
      TErrorCodes,
      TErrorConfigMap,
      TRouteParamMap,
      TRouteContextMap,
      TRouteConfigMap
    >,
    'customizeRoutes' | 'defineGlobalConfig'
  > {
    return new ConfigBuilder<
      TRouteTypes,
      TErrorCodes,
      TErrorConfigMap,
      TRouteParamMap,
      TRouteContextMap,
      TRouteConfigMap
    >(this.construct, this.errorMap, defaultError);
  }

  public defineRouteExtraProps<T extends RouteExtraPropsMap<TRouteTypes, ZodObject<ZodRawShape> | undefined>>(
    map: T
  ): Pick<
    ConfigBuilder<
      TRouteTypes,
      TErrorCodes,
      TErrorConfigMap,
      T,
      RouteContextMap<TRouteTypes, T>,
      RouteConfigMap<
        TRouteTypes,
        TErrorCodes,
        T,
        RouteContextMap<TRouteTypes, T>
      >
    >,
    'defineRoutes' | 'defineRouteContexts' | 'customizeErrors'
  > {
    return new ConfigBuilder<
      TRouteTypes,
      TErrorCodes,
      TErrorConfigMap,
      T,
      RouteContextMap<TRouteTypes, T>,
      RouteConfigMap<
        TRouteTypes,
        TErrorCodes,
        T,
        RouteContextMap<TRouteTypes, T>
      >
    >(
      this.construct,
      this.errorMap,
      this.defaultError,
      map,
      undefined,
      undefined,
      undefined
    );
  }
  public defineRouteContexts<T extends RouteContextMap<TRouteTypes, TRouteParamMap>>(
    map: T
  ): Pick<
    ConfigBuilder<
      TRouteTypes,
      TErrorCodes,
      TErrorConfigMap,
      TRouteParamMap,
      T,
      RouteConfigMap<TRouteTypes, TErrorCodes, TRouteParamMap, T>
    >,
    'defineRoutes' | 'customizeErrors'
  > {
    return new ConfigBuilder<
      TRouteTypes,
      TErrorCodes,
      TErrorConfigMap,
      TRouteParamMap,
      T,
      RouteConfigMap<TRouteTypes, TErrorCodes, TRouteParamMap, T>
    >(
      this.construct,
      this.errorMap,
      this.defaultError,
      this.routeParamMap,
      map,
      undefined,
      undefined
    );
  }

  public defineRoutes<
    T extends RouteConfigMap<
      TRouteTypes,
      TErrorCodes,
      TRouteParamMap,
      TRouteContextMap
    >
  >(
    map: OmitMappedField<T, 'extraProps' |'context' | 'contextFactory'>
  ): Pick<
    ConfigBuilder<
      TRouteTypes,
      TErrorCodes,
      TErrorConfigMap,
      TRouteParamMap,
      TRouteContextMap,
      T
    >,
    'customizeErrors' | 'defineGlobalConfig' | 'create'
  > {
    return new ConfigBuilder<
      TRouteTypes,
      TErrorCodes,
      TErrorConfigMap,
      TRouteParamMap,
      TRouteContextMap,
      T

    >(
      this.construct,
      this.errorMap,
      this.defaultError,
      this.routeParamMap,
      this.routeContextMap,
      map as T
    );
  }
  defineGlobalConfig<
    T extends Config<TRouteTypes, TErrorCodes, TErrorConfigMap, TRouteParamMap, TRouteContextMap, TRouteConfigMap>,
  >(
    conf: Omit<T, 'errors' | 'routes' | 'defaultError'>
  ): Pick<
   ConfigBuilder<
    TRouteTypes,
    TErrorCodes,
    TErrorConfigMap,
    TRouteParamMap,
    TRouteContextMap,
    TRouteConfigMap,
    T
  >,
  'create'
  > {
    return new ConfigBuilder<
    TRouteTypes,
    TErrorCodes,
    TErrorConfigMap,
    TRouteParamMap,
    TRouteContextMap,
    TRouteConfigMap,
    T
    >(
      this.construct,
      this.errorMap,
      this.defaultError,
      this.routeParamMap,
      this.routeContextMap,
      this.routeMap,
      conf
    );
  }
  public create<
    TRouteTypes extends string,
    TErrorCodes extends string,
    TConfig extends AnyConfig<TRouteTypes, TErrorCodes>
  >(
    routes: Record<string, TRouteTypes>,
    errors: Record<string, TErrorCodes>,
    spec: TConfig
  ): OpenApi<TRouteTypes, TErrorCodes, TConfig>;

  create(): OpenApi<TRouteTypes, TErrorCodes, TConfig>;

  create(a?: unknown, b?: unknown, conf?: unknown) {
    // custom path
    if (conf) {
      return this.construct(conf);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const routeMap: any = this.routeMap ?? undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const contextMap: any = this.routeContextMap ?? undefined;
    if (this.routeContextMap && this.routeMap) {
      for (const key of Object.keys(routeMap)) {
        routeMap[key].contextFactory = contextMap[key];
      }
    }
    // builder path
    const def = new DefaultConfig();
    const builtConf: TConfig = {
      ...def,
      ...this.conf,
      ...(routeMap ? {routes: routeMap} : {}),
      ...(this.errorMap ? {errors: this.errorMap} : {}),
      ...(this.defaultError ? {defaultError: this.defaultError} : {}),
    } as TConfig;
    return this.construct(builtConf);
  }
}
