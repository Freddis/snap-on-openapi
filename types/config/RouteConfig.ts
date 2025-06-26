import {ZodObject, ZodRawShape} from 'zod';
import {ContextParams} from './ContextParams';

export interface RouteConfig<
 TRouteType extends string,
 TErrorCode extends string,
 TExtraProps extends ZodObject<ZodRawShape>
> {
    authorization: boolean,
    context: (params: ContextParams<TRouteType, TExtraProps>) => Promise<object>,
    errors: {
      [key in TErrorCode]?: true;
    }
}
