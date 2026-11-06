import { createErrorHandler } from '../shared/errors';
import { showMessage } from '../ui';
import { recordError } from './error-log';

export const handleError = createErrorHandler({
  notify: showMessage,
  report: recordError,
  // report: (error) => yourReporter(error), // 接入时自行脱敏。
});
