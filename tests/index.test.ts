import * as pkg from '../src';
import { LoggerBase } from '../src/configuration/logger/logger-base';

describe('public exports', () => {
  test('should export LoggerBase so it can be extended externally', () => {
    expect(pkg.LoggerBase).toBe(LoggerBase);
  });

  test('should export the sleep utility', () => {
    expect(typeof pkg.sleep).toEqual('function');
  });
});
