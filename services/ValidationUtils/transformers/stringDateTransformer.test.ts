import {describe, expect, test} from 'vitest';
import {stringDateTransformer} from './stringDateTransformer';

describe('stringDateTransformer', () => {

  test('Can parse ISO date', async () => {
    const result = stringDateTransformer.safeParse('2025-07-03');
    expect(result.success).toBe(true);
    expect(result.data?.toISOString().split('T')[0]).toBe('2025-07-03');
  });

  test('Can parse Date object', async () => {
    const date = new Date('2025-07-03');
    const result = stringDateTransformer.safeParse(date);
    expect(result.success).toBe(true);
    expect(result.data?.toISOString().split('T')[0]).toBe('2025-07-03');
  });

  test("Doesn't throw on bad input", async () => {
    const result = stringDateTransformer.safeParse('jibberish');
    expect(result.success).toBe(false);
  });

  test('Rejects datetime string', async () => {
    const result = stringDateTransformer.safeParse('2025-07-03T08:33:32.442Z');
    expect(result.success).toBe(false);
  });

});
