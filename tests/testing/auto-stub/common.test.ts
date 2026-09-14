import { commonGet, commonHas } from '../../../src/testing/auto-stub/common';
import { TrapsType } from '../../../src/testing/auto-stub/common-types';

describe('commonHas', () => {
  test('should return true when the property exists in the target', () => {
    expect(commonHas({ foo: 'bar' }, 'foo')).toEqual(true);
  });

  test('should return false when the property is "then" and does not exist in the target', () => {
    expect(commonHas({}, 'then')).toEqual(false);
  });

  test('should return true when the property does not exist and is not "then"', () => {
    expect(commonHas({}, 'anything')).toEqual(true);
  });
});

describe('commonGet', () => {
  const buildTraps = (map: Map<string, unknown>): TrapsType => ({
    get: (target, prop, _receiver) => commonGet({ test: 'jest', target, prop, map, traps }),
    has: (target, prop) => commonHas(target, prop)
  });

  let traps: TrapsType;

  test('should return the target property directly when it exists', () => {
    const map = new Map();
    traps = buildTraps(map);

    const result = commonGet({ test: 'jest', target: { foo: 'bar' }, prop: 'foo', map, traps });

    expect(result).toEqual('bar');
  });

  test('should passthrough "calls" and "mock" properties for jest mocks', () => {
    const map = new Map();
    traps = buildTraps(map);
    const mockFn = jest.fn();
    mockFn('called');

    const result = commonGet({ test: 'jest', target: mockFn, prop: 'mock', map, traps });

    expect(result).toBe(mockFn.mock);
  });

  test('should return undefined when the property is "then" and not present in the target', () => {
    const map = new Map();
    traps = buildTraps(map);

    const result = commonGet({ test: 'jest', target: {}, prop: 'then', map, traps });

    expect(result).toBeUndefined();
  });

  test('should create and cache a new stub proxy when the property is not present', () => {
    const map = new Map();
    traps = buildTraps(map);

    const first = commonGet({ test: 'jest', target: {}, prop: 'notThere', map, traps });
    const second = commonGet({ test: 'jest', target: {}, prop: 'notThere', map, traps });

    expect(first).toBe(second);
    expect(map.get('notThere')).toBe(first);
  });
});
