import {ILogger} from './types/ILogger';
import {LogLevel} from './types/LogLevel';

export class Logger implements ILogger {
  protected invoker: string;
  public static logLevel: LogLevel = LogLevel.all;
  public static showTime: boolean = true;

  constructor(invoker: string, originalInvoker?: string) {
    this.invoker = (originalInvoker ? `${originalInvoker}:` : '') + invoker;
  }

  public derrive(invoker: string): Logger {
    return new Logger(invoker, this.invoker);
  }

  protected get ctor() {
    return this.constructor as typeof Logger;
  }

  public info(message: string, data?: Record<string, unknown>) {
    if (this.ctor.logLevel === LogLevel.error) {
      return;
    }
    this.log(message, 'info', data);
  }

  public debug(message: string, data?: object) {
    if (this.ctor.logLevel !== LogLevel.all) {
      return;
    }
    this.log(message, 'debug', data);
  }

  public error(message: string | null, error: unknown, data?: object) {
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

  public getInvoker(): string {
    return this.invoker;
  }

  public static setLogLevel(level: LogLevel) {
    this.logLevel = level;
  }

  protected log(message: string, level: string, data?: object) {
    const now = new Date();
    const timePart = this.ctor.showTime ? now.toISOString() : '';
    const msg = `${timePart}[${level}][${this.invoker}]: ${message}`;
    console.log(msg);
    if (data) {
      console.dir(this.transformData(data), {depth: null});
    }
  }

  protected transformData(data: object): unknown {
    const plain = this.removeCircularity(data);
    return plain;
  }

  protected removeCircularity(data: object): object {
    if (typeof data !== 'object') {
      return data;
    }
    // todo: for some reason this is slow
    // update: this reason is DOM objects, which are much deeeper than backend objects
    const recurse = (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      obj: Record<string, any>,
      path: string[] = ['self'],
      seen: Map<object, string> = new Map()
    ): object => {
      const currentPath = path.join('.');
      seen.set(obj, currentPath);
      if (Array.isArray(obj)) {
        const result: unknown[] = [];
        obj.forEach((val, index) => {
          if (typeof val === 'object' && val !== null) {
            const existingPath = seen.get(val);
            if (existingPath) {
              result.push(`circular->${existingPath === 'self' ? 'self' : existingPath.replace('self.', '')}`);
            } else {
              result.push(recurse(val, [...path, index.toString()], new Map(seen)));
            }
          } else {
            result.push(val);
          }
        });
        return result;
      }
      if (obj instanceof Date) {
        return obj;
      }
      const result: Record<string, unknown> = {};
      for (const key of Object.keys(obj)) {
        const val = obj[key];
        if (typeof val === 'object' && val !== null) {
          const existingPath = seen.get(val);
          if (existingPath) {
            result[key] = `circular->${existingPath === 'self' ? 'self' : existingPath.replace('self.', '')}`;
          } else {
            result[key] = recurse(val, [...path, key], new Map(seen));
          }
        } else {
          result[key] = val;
        }
      }
      return result;
    };
    const result = recurse(data);
    return result;
  }
}
