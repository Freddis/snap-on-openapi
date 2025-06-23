import {afterEach, describe, expect, test} from 'vitest';
import {TestUtils} from '../TestUtils/TestUtils';
import {existsSync, rmSync} from 'fs';
import {resolve} from 'path';

describe('ClientGenerator', async () => {
  const api = TestUtils.createOpenApi();
  const dirs = [
    'open-api-client',
    'temp/client',
  ];
  afterEach(() => {

    for (const dir of dirs) {
      if (!existsSync(dir)) {
        continue;
      }
      rmSync(dir, {recursive: true, force: true});
    }
  });

  test('Happy Path', async () => {
    await api.clientGenerator.generate();

    const directoryCreated = await TestUtils.awaitGeneric(1000, 200, async () => {
      const fileExists = existsSync(resolve('open-api-client'));
      return fileExists || null;
    });
    expect(directoryCreated).toBe(true);
  });

  test('Config overrides work', async () => {
    await api.clientGenerator.generate({
      output: 'temp/client',
    });

    const directoryCreated = await TestUtils.awaitGeneric(1000, 200, async () => {
      const fileExists = existsSync(resolve('temp/client'));
      return fileExists || null;
    });
    expect(directoryCreated).toBe(true);
  });
});
