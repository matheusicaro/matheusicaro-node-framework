import { ErrorCode } from '../../src/errors';
import { InvalidArgumentError } from '../../src/errors/invalid-argument.error';

/**
 * TODO: implement tests for InvalidArgumentError
 *     - issue: https://github.com/matheusicaro/mi-node-framework/issues/3
 */
describe('InvalidArgumentError', () => {
  describe('constructor', () => {
    test('should set the default fields correctly when only message is passed', () => {
      const error = new InvalidArgumentError('error');

      console.log(error.name);

      expect(error.message).toEqual('error');
      expect(error.code).toEqual(ErrorCode.INVALID_ARGUMENT);
      expect(error.isErrorBase).toEqual(true);
      expect(error.logData).toBeUndefined();
      expect(error.logLevel).toBeUndefined();
      expect(error.originalErrorMessage).toBeUndefined();
      expect(error.userMessage).toBeUndefined();
      expect(error.stack).not.toBeUndefined();
    });

    test('should set the default fields correctly when message and user message are passed', () => {
      const error = new InvalidArgumentError('error', {
        userMessage: 'user message'
      });

      expect(error.message).toEqual('error');
      expect(error.userMessage).toEqual('user message');
      expect(error.code).toEqual(ErrorCode.INVALID_ARGUMENT);
      expect(error.isErrorBase).toEqual(true);
      expect(error.logData).toBeUndefined();
      expect(error.logLevel).toBeUndefined();
      expect(error.originalErrorMessage).toBeUndefined();
      expect(error.stack).not.toBeUndefined();
    });

    test('should call supper with the correct args', () => {});

    test('should create the error correctly only with message', () => {
      const error = new InvalidArgumentError('error');

      expect(error).toBeInstanceOf(InvalidArgumentError);
    });

    test('should throw error correctly with no errors in the constructor', () => {
      const error = new InvalidArgumentError('error');

      expect(() => {
        throw error;
      }).toThrow(InvalidArgumentError);
    });
  });
});
