import { container } from 'tsyringe';
import { Response } from 'express';

import {
  DependencyInjectionTokens,
  ErrorBase,
  InvalidArgumentError,
  InvalidRequestError,
  InvalidStateError,
  LoggerPort,
  NotFoundError,
  RestControllerBase
} from '../../src';

class TestController extends RestControllerBase {
  constructor(customStatusCode?: number, customPayload?: { message: string }) {
    super(customStatusCode, customPayload);
  }

  public handleError(input: {
    error: unknown;
    responseData?: Record<string, unknown>;
    response: Response;
    setStatusCodeByErrorType?: boolean;
  }) {
    return this.handleErrorThenRespondFailedOnRequest(input);
  }
}

describe('RestControllerBase', () => {
  const logger: LoggerPort = {
    info: jest.fn(),
    error: jest.fn(),
    exception: jest.fn()
  };

  const buildResponse = (): Response => {
    const response = {} as Response;
    response.status = jest.fn().mockReturnValue(response);
    response.json = jest.fn().mockReturnValue(response);
    return response;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    container.reset();
    container.register(DependencyInjectionTokens.Logger, { useValue: logger });
  });

  describe('handleErrorThenRespondFailedOnRequest', () => {
    test('should respond with the default status code and payload when no custom values are informed', () => {
      const controller = new TestController();
      const response = buildResponse();

      controller.handleError({ error: new Error('boom'), response });

      expect(response.status).toHaveBeenCalledWith(502);
      expect(response.json).toHaveBeenCalledWith({ message: 'error on processing the request' });
    });

    test('should respond with the custom status code and payload when informed', () => {
      const controller = new TestController(418, { message: 'custom message' });
      const response = buildResponse();

      controller.handleError({ error: new Error('boom'), response });

      expect(response.status).toHaveBeenCalledWith(418);
      expect(response.json).toHaveBeenCalledWith({ message: 'custom message' });
    });

    test('should merge the responseData into the response payload', () => {
      const controller = new TestController();
      const response = buildResponse();

      controller.handleError({ error: new Error('boom'), response, responseData: { extra: 'data' } });

      expect(response.json).toHaveBeenCalledWith({
        message: 'error on processing the request',
        extra: 'data'
      });
    });

    test('should include the userMessage in the payload when the error is an ErrorBase with userMessage', () => {
      const controller = new TestController();
      const response = buildResponse();
      const error = new InvalidStateError('boom', { userMessage: 'a user message' });

      controller.handleError({ error, response });

      expect(response.json).toHaveBeenCalledWith({
        message: 'error on processing the request',
        userMessage: 'a user message'
      });
    });

    describe('when setStatusCodeByErrorType is true', () => {
      test.each([
        [InvalidArgumentError, 400],
        [InvalidRequestError, 400],
        [NotFoundError, 404]
      ])('should set the status code by the %s type', (ErrorClass, statusCode) => {
        const controller = new TestController();
        const response = buildResponse();
        const error = new (ErrorClass as new (message: string) => ErrorBase)('boom');

        controller.handleError({ error, response, setStatusCodeByErrorType: true });

        expect(response.status).toHaveBeenCalledWith(statusCode);
      });

      test('should fall back to the default status code for an unmapped error type', () => {
        const controller = new TestController();
        const response = buildResponse();
        const error = new InvalidStateError('boom');

        controller.handleError({ error, response, setStatusCodeByErrorType: true });

        expect(response.status).toHaveBeenCalledWith(502);
      });
    });

    describe('logging', () => {
      test('should not log when the error is an ErrorBase, since ErrorBase logs on construction', () => {
        const controller = new TestController();
        const response = buildResponse();
        const error = new InvalidStateError('boom', { logData: { foo: 'bar' } });

        expect(logger.exception).toHaveBeenCalledTimes(1);
        jest.clearAllMocks();

        controller.handleError({ error, response });

        expect(logger.exception).not.toHaveBeenCalled();
        expect(logger.error).not.toHaveBeenCalled();
      });

      test('should log the error message when the error is a plain Error', () => {
        const controller = new TestController();
        const response = buildResponse();
        const error = new Error('boom');

        controller.handleError({ error, response });

        expect(logger.error).toHaveBeenCalledWith({
          message: `Error in RestControllerBase - ${error.message}`,
          error
        });
      });

      test('should log an unknown error message when the error is not an Error instance', () => {
        const controller = new TestController();
        const response = buildResponse();

        controller.handleError({ error: 'not an error', response });

        expect(logger.error).toHaveBeenCalledWith({
          message: 'Unknown error in RestControllerBase'
        });
      });
    });
  });
});
