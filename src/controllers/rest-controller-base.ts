import { container } from 'tsyringe';
import { NextFunction, Request, Response } from 'express';

import {
  DependencyInjectionTokens,
  LoggerPort,
  ErrorBase,
  InvalidArgumentError,
  InvalidRequestError,
  NotFoundError
} from '../';

/**
 * Interfaces to defined a the args of the ControllerBase.
 * If express is changed to another lib, we might just need to replace the express types here.
 */
export interface ServerRequest extends Request {}
export interface ServerResponse extends Response {}
export interface ServerResponseData<T> extends Response<T> {}
export interface ServerNextFunction extends NextFunction {}

const BAD_GATEWAY_STATUS_CODE = 502;
const BAD_REQUEST_STATUS_CODE = 400;
const NOT_FOUND_STATUS_CODE = 404;

/**
 * RestControllerBase is a base for controller implementations for HTTP REST requests
 *  - MyController extends RestControllerBase
 *
 * How to use: https://github.com/matheusicaro/mi-node-framework#rest-controller-base
 *
 */
abstract class RestControllerBase {
  protected logger: LoggerPort;
  protected failedRequestStatusCode;
  protected failedRequestPayload;

  constructor(
    customFailedRequestStatusCode = BAD_GATEWAY_STATUS_CODE,
    customFailedRequestPayload = { message: 'error on processing the request' }
  ) {
    this.logger = container.resolve(DependencyInjectionTokens.Logger);

    this.failedRequestStatusCode = customFailedRequestStatusCode;
    this.failedRequestPayload = customFailedRequestPayload;
  }

  /**
   * This function will handle with errors in a default behavior of:
   *  - Response to the client with 502 http status code as a default if a custom status is not informed
   *  - Response with a default payload if a custom payload is not informed
   *  - Log the error details
   *
   * @param error
   * @param responseData: metadata to be added in the response payload
   * @param response: ServerResponse
   * @param setStatusCodeByErrorType: will set default status code by error type from errors, ex: NotFoundError[404], InvalidRequestError[400], etc
   * @returns
   */
  protected handleErrorThenRespondFailedOnRequest(input: {
    error: unknown | ErrorBase;
    responseData?: Record<string, unknown>;
    response: ServerResponse;
    setStatusCodeByErrorType?: boolean;
  }): ServerResponse {
    this.logError(input.error);

    const userMessage = (input.error as ErrorBase)?.userMessage;

    const statusCode = input.setStatusCodeByErrorType
      ? this.getStatusCodeByError(input.error)
      : this.failedRequestStatusCode;

    return input.response.status(statusCode).json({
      ...this.failedRequestPayload,
      ...(userMessage && { userMessage }),
      ...(input.responseData && { ...input.responseData })
    });
  }

  private getStatusCodeByError(error: unknown): number {
    if (error instanceof InvalidArgumentError || error instanceof InvalidRequestError) {
      return BAD_REQUEST_STATUS_CODE;
    }

    if (error instanceof NotFoundError) {
      return NOT_FOUND_STATUS_CODE;
    }

    return BAD_GATEWAY_STATUS_CODE;
  }

  private logError(error: unknown): void {
    if (error instanceof ErrorBase && error.isErrorBase) {
      // ErrorBase already handle with errors and logger it when ErrorBase is thrown
      return;
    }

    if (error instanceof Error) {
      this.logger.error({
        message: `Error in ${RestControllerBase.name} - ${error.message}`,
        error
      });

      return;
    }

    this.logger.error({
      message: `Unknown error in ${RestControllerBase.name}`
    });
  }
}

export { RestControllerBase };
