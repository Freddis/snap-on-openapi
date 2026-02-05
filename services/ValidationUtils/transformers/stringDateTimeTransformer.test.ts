import {describe, expect, test} from 'vitest';
import {stringDateTimeTransformer} from './stringDateTimeTransformer';

describe('stringDateTimeTransformer', () => {

  test('Can parse ISO datetime', async () => {
    const result = stringDateTimeTransformer.safeParse('2025-07-03T08:33:32.442Z');
    expect(result.success).toBe(true);
    expect(result.data?.toISOString()).toBe('2025-07-03T08:33:32.442Z');
  });

  test("Doesn't throw on bad input", async () => {
    const result = stringDateTimeTransformer.safeParse('jibberish');
    expect(result.success).toBe(false);
  });

});
