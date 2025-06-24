export type TanStackStartAPIMethodCallback = (ctx: {
  request: Request;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: any;
}) => Response | Promise<Response>;
