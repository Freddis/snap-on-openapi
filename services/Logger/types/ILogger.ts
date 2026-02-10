export interface ILogger {
  info(message: string, data?: Record<string, unknown>): void;
  debug(message: string, data?: object): void;
  error(message: string | null, error: unknown, data?: object): void;
  getInvoker(): string;
  derrive(invoker: string): ILogger;
}
