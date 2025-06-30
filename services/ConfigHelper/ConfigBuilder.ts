import {ErrorConfigMap} from '../../types/config/ErrorConfigMap';
import {NarrowConfig} from '../../types/config/NarrowConfig';
import {RouteConfigMap} from '../../types/config/RouteConfigMap';
import {OpenApi} from '../..';
import {Config} from '../../types/config/Config';
import {DefaultConfig} from './types/DefaultConfig';
import {OpenApiConstructor} from './types/OpenApiConstructor';
import {OmitMappedField} from '../../types/config/OmitMappedField';
import {RouteValidatorMap} from '../../types/config/RouteValidatorMap';

export class ConfigBuilder<
  TRouteTypes extends string,
  TErrorCodes extends string,
  TErrorConfigMap extends ErrorConfigMap<TErrorCodes>,
  TRouteParamMap extends RouteValidatorMap<TRouteTypes>,
  TRouteContextMap extends RouteValidatorMap<TRouteTypes>,
  TRouteConfigMap extends RouteConfigMap<TRouteTypes, TErrorCodes, TRouteParamMap, TRouteContextMap>,
  TConfig extends NarrowConfig<
    TRouteTypes,
    TErrorCodes,
    TErrorConfigMap,
    TRouteParamMap,
    TRouteContextMap,
    TRouteConfigMap
  > = NarrowConfig<
    TRouteTypes,
    TErrorCodes,
    TErrorConfigMap,
    TRouteParamMap,
    TRouteContextMap,
    TRouteConfigMap
  >
> {
  protected x!: NarrowConfig<
  TRouteTypes,
  TErrorCodes,
  ErrorConfigMap<TErrorCodes>,
  RouteValidatorMap<TRouteTypes>,
  RouteValidatorMap<TRouteTypes>,
  RouteConfigMap<TRouteTypes, TErrorCodes, RouteValidatorMap<TRouteTypes>, RouteValidatorMap<TRouteTypes>>
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
      RouteValidatorMap<T>,
      RouteValidatorMap<T>,
      RouteConfigMap<T, TErrorCodes, RouteValidatorMap<T>, RouteValidatorMap<T>>
    >,
    'defineRouteExtraParams' | 'defineRouteContexts' | 'defineRoutes'
  > {
    return new ConfigBuilder<
      T,
      TErrorCodes,
      TErrorConfigMap,
      RouteValidatorMap<T>,
      RouteValidatorMap<T>,
      RouteConfigMap<T, TErrorCodes, RouteValidatorMap<T>, RouteValidatorMap<T>>
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
      RouteValidatorMap<TRouteTypes>,
      RouteValidatorMap<TRouteTypes>,
      RouteConfigMap<
        TRouteTypes,
        T,
        RouteValidatorMap<TRouteTypes>,
        RouteValidatorMap<TRouteTypes>
      >
    >,
    'defineErrors'
  > {
    return new ConfigBuilder<
      TRouteTypes,
      T,
      ErrorConfigMap<T>,
      RouteValidatorMap<TRouteTypes>,
      RouteValidatorMap<TRouteTypes>,
      RouteConfigMap<
        TRouteTypes,
        T,
        RouteValidatorMap<TRouteTypes>,
        RouteValidatorMap<TRouteTypes>
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

  public defineRouteExtraParams<T extends RouteValidatorMap<TRouteTypes>>(
    map: T
  ): Pick<
    ConfigBuilder<
      TRouteTypes,
      TErrorCodes,
      TErrorConfigMap,
      T,
      RouteValidatorMap<TRouteTypes>,
      RouteConfigMap<
        TRouteTypes,
        TErrorCodes,
        T,
        RouteValidatorMap<TRouteTypes>
      >
    >,
    'defineRoutes' | 'defineRouteContexts' | 'customizeErrors'
  > {
    return new ConfigBuilder<
      TRouteTypes,
      TErrorCodes,
      TErrorConfigMap,
      T,
      RouteValidatorMap<TRouteTypes>,
      RouteConfigMap<
        TRouteTypes,
        TErrorCodes,
        T,
        RouteValidatorMap<TRouteTypes>
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
  public defineRouteContexts<T extends RouteValidatorMap<TRouteTypes>>(
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
    map: OmitMappedField<T, 'extraProps' |'context'>
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
    T extends TConfig,
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
    TConfig extends Config<TRouteTypes, TErrorCodes>
  >(
    routes: Record<string, TRouteTypes>,
    errors: Record<string, TErrorCodes>,
    spec: TConfig
  ): OpenApi<TRouteTypes, TErrorCodes, TConfig>;

  create(): OpenApi<TRouteTypes, TErrorCodes, NarrowConfig<
  TRouteTypes,
  TErrorCodes,
  ErrorConfigMap<TErrorCodes>,
  RouteValidatorMap<TRouteTypes>,
  RouteValidatorMap<TRouteTypes>,
  RouteConfigMap<TRouteTypes, TErrorCodes, RouteValidatorMap<TRouteTypes>, RouteValidatorMap<TRouteTypes>>
 >>;

  create(a?: unknown, b?: unknown, conf?: unknown) {
    // custom path
    if (conf) {
      return this.construct(conf);
    }

    // builder path
    const def = new DefaultConfig();
    const builtConf: TConfig = {
      ...def,
      ...this.conf,
      ...(this.routeMap ? {routes: this.routeMap} : {}),
      ...(this.errorMap ? {errors: this.errorMap} : {}),
      ...(this.defaultError ? {defaultError: this.defaultError} : {}),
    } as TConfig;
    return this.construct(builtConf);
  }
}
