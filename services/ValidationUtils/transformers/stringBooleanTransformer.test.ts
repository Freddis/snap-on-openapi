import {describe, expect, test} from 'vitest';
import {stringBooleanTransformer} from './stringBooleanTransformer';

describe('stringBooleanTransformer', () => {

  test('Can parse true', async () => {
    const result = stringBooleanTransformer.safeParse('true');
    expect(result.success).toBe(true);
    expect(result.data).toBe(true);
  });

  test('Can parse false', async () => {
    const result = stringBooleanTransformer.safeParse('true');
    expect(result.success).toBe(true);
    expect(result.data).toBe(true);
  });

  test('Fails on non booleans', async () => {
    const result = stringBooleanTransformer.safeParse('');
    expect(result.success).toBe(false);
    expect(result.error?.errors[0]?.message).toContain('Invalid enum value');
  });

});
