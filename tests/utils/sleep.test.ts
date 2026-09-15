import { sleep } from '../../src/utils/sleep';

describe('sleep', () => {
  test('should resolve after roughly the given delay', async () => {
    const start = Date.now();

    await sleep(50);

    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(45);
  });

  test('should resolve to undefined', async () => {
    const result = await sleep(0);

    expect(result).toBeUndefined();
  });
});
