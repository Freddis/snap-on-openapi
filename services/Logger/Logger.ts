import { LogLevel } from "./types/LogLevel";


export class Logger {
  private invoker: string;
  protected static logLevel: LogLevel = LogLevel.all;
  protected static showTime: boolean = false;
  protected static inlineObjects: boolean = true;
  public static useJsonStringify: boolean = false;

  constructor(invoker: string, originalInvoker?: string) {
    this.invoker = (originalInvoker ? `${originalInvoker}:` : '') + invoker;
  }

  info(message: string, data?: Record<string, unknown>) {
    if (Logger.logLevel === LogLevel.error) {
      return;
    }
    this.log(message, 'info', data);
  }

  debug(message: string, data?: object) {
    if (Logger.logLevel !== LogLevel.all) {
      return;
    }
    this.log(message, 'debug', data);
  }

  error(message: string | null, error: unknown, data?: object) {
    let newMessage = 'UnkownError: ';
    if (!message) {
      if (error instanceof Error) {
        newMessage = error.message;
      }
    } else {
      newMessage = message;
    }
    this.log(newMessage, 'error', data);
    console.log(error);
  }

  static setLogLevel(level: LogLevel) {
    this.logLevel = level;
  }
  protected log(message: string, level: string, data?: object) {
    const now = new Date();
    const timePart = Logger.showTime ? now.toISOString() : '';
    const msg = `${timePart}[${level}][${this.invoker}]: ${message}`;
    if (Logger.inlineObjects) {
      if (data) {
        console.log(msg, this.transformData(data));
        return;
      }
      console.log(msg);
      return;
    }
    console.log(msg);
    if (data) {
      console.dir(this.transformData(data));
    }
  }

  getInvoker(): string {
    return this.invoker;
  }

  extend(name: string) {
    return new Logger(name, this.invoker);
  }

  protected transformData(data: object): unknown {
    // const plain = this.removeCircularity(data);
    const plain = data;
    if (Logger.useJsonStringify) {
      return JSON.stringify(plain, null, 2);
    }
    return plain;
  }
  protected removeCircularity(data: object): unknown {
    // todo: for some reason this is slow
    // update: this reason is DOM objects, which are much deeeper than backend objects
    const seen = new Set();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recurse = (obj: Record<string, any>, path: string[] = []) => {
      const result: Record<string, unknown> = {};
      for (const key of Object.keys(obj)) {
        if (typeof obj[key] === 'object' && obj[key]) {
          if (seen.has(obj[key])) {
            result[key] = 'circular-->' + path.join('.');
            continue;
          }
          seen.add(obj[key]);
          const newPath = [...path, key];
          result[key] = recurse(obj[key], newPath);
          continue;
        }
        result[key] = obj[key];
      }
      return result;
    };
    const result = recurse(data);
    return result;
  }

  die(message: string | null, data?: Record<string, unknown>) {
    this.info(message ?? '', data);
    process.exit(0);
  }
}
