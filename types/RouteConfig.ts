import {ContextParams} from './ContextParams';

export interface RouteConfig<TRouteType extends string, TErrorCode extends string > {
      authorization: boolean,
      context: (params: ContextParams<TRouteType>)=> Promise<object>,
      errors: {
        [key in TErrorCode]?: true;
      }
}
