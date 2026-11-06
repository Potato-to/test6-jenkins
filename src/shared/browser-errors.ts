import type { App } from 'vue';
import { AppError, type ErrorHandler } from './errors';

export function installBrowserErrors(app: App, handleError: ErrorHandler) {
  const previous = app.config.errorHandler;
  app.config.errorHandler = (error) => {
    handleError(error);
  };
  const onError = (event: Event) => {
    if (event.target instanceof Element && event.target !== document.documentElement) {
      handleError(new AppError('resource'));
    } else {
      handleError((event as ErrorEvent).error ?? new AppError('runtime'));
    }
  };
  const onRejection = (event: PromiseRejectionEvent) => {
    handleError(event.reason);
  };
  window.addEventListener('error', onError, true);
  window.addEventListener('unhandledrejection', onRejection);
  return () => {
    app.config.errorHandler = previous;
    window.removeEventListener('error', onError, true);
    window.removeEventListener('unhandledrejection', onRejection);
  };
}
