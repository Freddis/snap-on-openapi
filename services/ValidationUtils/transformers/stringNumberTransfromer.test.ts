import {describe, expect, test} from 'vitest';
import {stringNumberTransformer} from './stringNumberTransfromer';

describe('stringNumberTransfromer', () => {

  test('Can parse integers', async () => {
    const result = stringNumberTransformer.safeParse('123');
    expect(result.success).toBe(true);
    expect(result.data).toBe(123);
  });

  test('Can parse float', async () => {
    const result = stringNumberTransformer.safeParse('123.232');
    expect(result.success).toBe(true);
    expect(result.data).toBe(123.232);
  });


  test('Can parse negatives', async () => {
    const result = stringNumberTransformer.safeParse('-123.232');
    expect(result.success).toBe(true);
    expect(result.data).toBe(-123.232);
  });

  test("Doesn't throw on bad input", async () => {
    const result = stringNumberTransformer.safeParse('jibberish');
    expect(result.success).toBe(false);
  });

  test("Empty string don't pass", async () => {
    const result = stringNumberTransformer.safeParse('');
    expect(result.success).toBe(false);
  });

  test('Accounting for infinity', async () => {
    const result = stringNumberTransformer.safeParse(Infinity);
    expect(result.success).toBe(false);
    const result2 = stringNumberTransformer.safeParse('Infinity');
    expect(result2.success).toBe(false);
  });

  test('Accounting for NaN', async () => {
    const result = stringNumberTransformer.safeParse(NaN);
    expect(result.success).toBe(false);
    const result2 = stringNumberTransformer.safeParse('NaN');
    expect(result2.success).toBe(false);
  });

  test('-0', async () => {
    const result = stringNumberTransformer.safeParse('-0');
    expect(result.success).toBe(true);
    expect(result.data).toBe(-0);

    const result2 = stringNumberTransformer.safeParse('-000');
    expect(result2.success).toBe(true);
    expect(result2.data).toBe(-0);
  });

});
