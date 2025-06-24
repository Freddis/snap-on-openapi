import {TanStackApiMethod} from './TanstackApiMethod';
import {TanStackStartAPIMethodCallback} from './TanStackStartAPIMethodCallback';

export type TanStackApiRoute<TPath extends string> = {
  path: TPath;
  methods: Partial<Record<TanStackApiMethod, TanStackStartAPIMethodCallback>>;
};
