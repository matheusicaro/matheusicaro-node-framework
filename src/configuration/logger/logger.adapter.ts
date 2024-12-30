import { LoggerBase } from './logger-base';
import { LoggerPort } from './logger.port';

/**
 * LoggerAdapter to be injected as a default configs for the framework
 */
class LoggerAdapter extends LoggerBase implements LoggerPort {
  constructor() {
    super();
  }
}

export { LoggerAdapter };
