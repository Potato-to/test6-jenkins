import type { ErrorHandler } from './errors';

type RejectionListener = (event: { reason: unknown }) => void;
export interface UniErrorEvents {
  onUnhandledRejection?: (listener: RejectionListener) => void;
  offUnhandledRejection?: (listener: RejectionListener) => void;
}

// Reuse the callback when a platform supports registration but not removal.
export function createUniErrorListener(api: UniErrorEvents, handleError: ErrorHandler) {
  let active = false;
  let registered = false;
  const listener: RejectionListener = (event) => {
    if (active) handleError(event.reason);
  };
  const stop = () => {
    active = false;
    if (registered && typeof api.offUnhandledRejection === 'function') {
      api.offUnhandledRejection(listener);
      registered = false;
    }
  };
  return {
    start() {
      active = true;
      if (!registered && typeof api.onUnhandledRejection === 'function') {
        api.onUnhandledRejection(listener);
        registered = true;
      }
      return stop;
    },
    stop,
  };
}
