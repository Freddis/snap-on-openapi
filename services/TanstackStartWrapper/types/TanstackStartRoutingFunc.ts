import {TanStackCreateAPIRouteFn} from './TanStackCreateAPIRouteFn';

export type TanstackStartRoutingFunc<T extends string> = (path: T) => TanStackCreateAPIRouteFn<T>
