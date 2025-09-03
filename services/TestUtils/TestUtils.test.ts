import {describe, expect, test} from 'vitest';
import {TestUtils} from './TestUtils';

describe('TestUtils', () => {

  test('Await generic fails on timeout', async () => {
    const nullVal = await TestUtils.awaitGeneric<string|null>(500, 50, async () => {
      return null;
    });
    expect(nullVal).toBe(null);
  });

  test('Await generic fails on timeout', async () => {
    let val: boolean | null = null;
    setTimeout(() => {
      val = true;
    }, 300);
    const gatheredVal = await TestUtils.awaitGeneric(1000, 50, async () => {
      return val;
    });
    expect(val).toBe(gatheredVal);
  });

});
