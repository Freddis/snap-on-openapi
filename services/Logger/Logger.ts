import {LogLevel} from './types/LogLevel';

export class Logger {
  protected invoker: string;
  public static logLevel: LogLevel = LogLevel.all;
  public static showTime: boolean = true;

  constructor(invoker: string, originalInvoker?: string) {
    this.invoker = (originalInvoker ? `${originalInvoker}:` : '') + invoker;
  }

  public info(message: string, data?: Record<string, unknown>) {
    if (Logger.logLevel === LogLevel.error) {
      return;
    }
    this.log(message, 'info', data);
  }

  public debug(message: string, data?: object) {
    if (Logger.logLevel !== LogLevel.all) {
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
    const timePart = Logger.showTime ? now.toISOString() : '';
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

  protected removeCircularity(data: object): unknown {
    if (typeof data !== 'object') {
      return data;
    }
    // todo: for some reason this is slow
    // update: this reason is DOM objects, which are much deeeper than backend objects
    const seen = new Set();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recurse = (obj: Record<string, any>, path: string[] = []) => {
      // This is done like that to avoid fighting with types.
      // There is no actual need in processing arrays and objects in separate cycles.
      if (Array.isArray(obj)) {
        const result: unknown[] = [];
        let index = -1;
        for (const val of obj) {
          index++;
          if (typeof val === 'object' && val) {
            if (seen.has(val)) {
              result.push('circular->' + path.join('.'));
              continue;
            }
            seen.add(val);
            const newPath = [...path, index.toString()];
            result.push(recurse(val, newPath));
            continue;
          }
          result.push(val);
        }
        return result;
      }
      if (obj instanceof Date) {
        return obj;
      }
      const result: Record<string, unknown> = {};
      for (const key of Object.keys(obj)) {
        if (typeof obj[key] === 'object' && obj[key]) {
          if (seen.has(obj[key])) {
            result[key] = 'circular->' + path.join('.');
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
}
