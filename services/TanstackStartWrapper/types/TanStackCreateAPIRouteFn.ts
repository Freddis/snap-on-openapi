import {TanStackApiMethod} from './TanstackApiMethod';
import {TanStackApiRoute} from './TanStackAPIRoute';
import {TanStackStartAPIMethodCallback} from './TanStackStartAPIMethodCallback';

export type TanStackCreateAPIRouteFn<TPath extends string> = (
  methods: Partial<Record<TanStackApiMethod, TanStackStartAPIMethodCallback>>
 ) => TanStackApiRoute<TPath>;
