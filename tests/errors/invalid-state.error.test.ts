import { container } from 'tsyringe';

import { DependencyRegistry, ErrorCode, InvalidStateError } from '../../src';

describe('InvalidStateError', () => {
  beforeEach(() => {
    container.reset();
  });

  describe('constructor', () => {
    test('should set the default fields correctly when only message is passed', () => {
      const error = new InvalidStateError('error');

      expect(error.message).toEqual('error');
      expect(error.code).toEqual(ErrorCode.INVALID_STATE);
      expect(error.isErrorBase).toEqual(true);
      expect(error.logData).toBeUndefined();
      expect(error.logLevel).toBeUndefined();
      expect(error.originalErrorMessage).toBeUndefined();
      expect(error.userMessage).toBeUndefined();
      expect(error.stack).not.toBeUndefined();
    });

    test('should set the default fields correctly when message and user message are passed', () => {
      const error = new InvalidStateError('error', {
        userMessage: 'user message'
      });

      expect(error.message).toEqual('error');
      expect(error.userMessage).toEqual('user message');
      expect(error.code).toEqual(ErrorCode.INVALID_STATE);
      expect(error.isErrorBase).toEqual(true);
      expect(error.logData).toBeUndefined();
      expect(error.logLevel).toBeUndefined();
      expect(error.originalErrorMessage).toBeUndefined();
      expect(error.stack).not.toBeUndefined();
    });

    test('should default the message when no message is passed', () => {
      const error = new InvalidStateError({ userMessage: 'user message' });

      expect(error.message).toEqual('Invalid state found during service request');
    });

    test('should log via the registry when logData and registry are both passed', () => {
      const registry = new DependencyRegistry([]);

      const error = new InvalidStateError('error', { logData: { foo: 'bar' }, registry });

      expect(error.logData).toEqual({ foo: 'bar' });
      expect(error.logLevel).toEqual('ERROR');
    });

    test('should throw when logData is passed without a registry', () => {
      expect(() => new InvalidStateError('error', { logData: { foo: 'bar' } })).toThrow(
        'InvalidStateError: trace.registry is required when trace.logData is informed'
      );
    });
  });
});
