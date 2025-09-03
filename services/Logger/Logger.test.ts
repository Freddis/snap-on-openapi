
import {afterEach, beforeEach, describe, expect, test} from 'vitest';
import {Logger} from './Logger';
import {LogLevel} from './types/LogLevel';

describe('Logger', () => {
  const consoleLogBackup = console.log;
  const consoleDirBackup = console.dir;
  let messages: string[] = [];
  const fakeLog = (msg: string) => {
    messages.push(msg);
    consoleLogBackup(msg);
  };
  const fakeDir = (msg: string) => {
    messages.push(msg);
    consoleDirBackup(msg);
  };
  beforeEach(() => {
    console.log = fakeLog;
    console.dir = fakeDir;
    messages = [];
    Logger.showTime = true;
    Logger.setLogLevel(LogLevel.all);
  });
  afterEach(() => {
    console.log = consoleLogBackup;
    console.dir = consoleDirBackup;
  });

  test('Logs output to console', async () => {
    const logger = new Logger('invoker');
    const now = new Date();
    logger.info('Hello there');
    const nowStr = now.toISOString();
    expect(messages[messages.length - 1]).toContain('Hello there');
    // this has less than 1/1000 chance of failure (never zero)
    // change 3 to 4 in the next line if it bothers you
    expect(messages[messages.length - 1]).toContain(nowStr.substring(0, nowStr.length - 4));
    expect(messages[messages.length - 1]).toContain('[invoker]');
    expect(messages[messages.length - 1]).toContain('[info]');
  });

  test('Time can be omitted', async () => {
    const logger = new Logger('invoker');
    const now = new Date();
    logger.info('Hello there');
    const nowStr = now.toISOString();
    expect(messages[messages.length - 1]).toContain(nowStr.substring(0, nowStr.length - 4));
    messages = [];
    Logger.showTime = false;
    logger.info('Hello there');
    expect(messages[messages.length - 1]).not.toContain(nowStr.substring(0, nowStr.length - 4));
  });

  test('Outputs data to console', async () => {
    const logger = new Logger('invoker');
    logger.info('Hello there', {myNameIs: 'Alex'});
    consoleLogBackup(messages);
    expect(JSON.stringify(messages[messages.length - 1])).toContain('myNameIs');
    expect(JSON.stringify(messages[messages.length - 1])).toContain('Alex');
    expect(messages[messages.length - 2]).toContain('Hello there');
  });

  test('Outputs error messages', async () => {
    const logger = new Logger('invoker2');
    logger.error('Hello myerror', new Error('My error message'));
    expect(messages[messages.length - 1]?.toString()).toContain('My error message');
    expect(messages[messages.length - 2]).toContain('Hello myerror');
    expect(messages[messages.length - 2]).toContain('[error]');
    expect(messages[messages.length - 2]).toContain('[invoker2]');
  });


  test('Outputs message from error if no message given', async () => {
    const logger = new Logger('invoker2');
    logger.error(null, new Error('My error message'));
    expect(messages[messages.length - 1]?.toString()).toContain('My error message');
    expect(messages[messages.length - 2]).toContain('My error message');
    expect(messages[messages.length - 2]).toContain('[error]');
    expect(messages[messages.length - 2]).toContain('[invoker2]');
  });

  test('Silent on info and debug if error log level is set', async () => {
    const logger = new Logger('invoker2');
    // pre-check
    logger.info('My info message');
    expect(messages[messages.length - 1]).toContain('My info message');

    //check
    messages = [];
    Logger.setLogLevel(LogLevel.error);
    logger.info('My info message');
    expect(messages[messages.length - 1]).toBe(undefined);
    logger.info('My info message');
    expect(messages[messages.length - 1]).toBe(undefined);
    logger.error('My error message', new Error('asdas'));
    expect(messages[messages.length - 2]).toContain('My error message');

  });


  test('Silent on debug if info log level is set', async () => {
    const logger = new Logger('invoker2');

    // pre-check
    logger.debug('My debug message');
    expect(messages[messages.length - 1]).toContain('My debug message');

    //check
    messages = [];
    Logger.setLogLevel(LogLevel.info);
    logger.debug('My debug message');
    expect(messages[messages.length - 1]).toBe(undefined);
    logger.info('My info message');
    expect(messages[messages.length - 1]).toContain('My info message');
    logger.error('My error message', new Error('asdas'));
    expect(messages[messages.length - 2]).toContain('My error message');
  });

  test('Returns correct invoker when extended', async () => {
    const logger = new Logger('NewInvoker', 'OriginalInvoker');
    expect(logger.getInvoker()).toBe('OriginalInvoker:NewInvoker');
  });

  test('Can Handle circular objects', async () => {
    const logger = new Logger('invoker');
    type TestType = {myNameIs: 'Alex', x: number[]} & {obj?: TestType, arr?: TestType[]};
    const obj: TestType = {myNameIs: 'Alex', x: [1, 2, 3]};
    obj.obj = obj;
    obj.arr = [obj, obj];
    logger.info('Hello there', obj);
    consoleLogBackup(messages);
    expect(JSON.stringify(messages[messages.length - 1])).toContain('myNameIs');
    expect(JSON.stringify(messages[messages.length - 1])).toContain('circular->obj');
    expect(messages[messages.length - 2]).toContain('Hello there');
  });

});
