import {describe, expect, test} from 'vitest';
import {stringDateTransformer} from './stringDateTransformer';

describe('stringDateTransformer', () => {

  test('Can parse ISO datetime', async () => {
    const result = stringDateTransformer.safeParse('2025-07-03T08:33:32.442Z');
    expect(result.success).toBe(true);
    expect(result.data?.toISOString()).toBe('2025-07-03T08:33:32.442Z');
  });

  test("Doesn't throw on bad input", async () => {
    const result = stringDateTransformer.safeParse('jibberish');
    expect(result.success).toBe(false);
  });

});
