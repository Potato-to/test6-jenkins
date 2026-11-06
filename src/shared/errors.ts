export type ErrorKind =
  | 'offline'
  | 'network'
  | 'timeout'
  | 'http'
  | 'business'
  | 'runtime'
  | 'resource'
  | 'cancelled'
  | 'unknown';

export class AppError extends Error {
  readonly kind: ErrorKind;
  readonly status?: number;
  readonly code?: string | number;
  constructor(
    kind: ErrorKind,
    message?: string,
    details: {
      status?: number;
      code?: string | number;
      cause?: unknown;
    } = {},
  ) {
    super(safeMessage(message) ?? fallbackMessage(kind, details.status), { cause: details.cause });
    this.name = 'AppError';
    this.kind = kind;
    this.status = details.status;
    this.code = details.code;
  }
}

export function safeMessage(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const message = value.trim();
  if (
    !message ||
    message.length > 160 ||
    /[<>\r\n]|(?:Error:|Exception:)|\bat\s+\S+\s*\(/i.test(message)
  )
    return undefined;
  return message;
}

export function fallbackMessage(kind: ErrorKind, status?: number): string {
  if (kind === 'http') {
    if (status && status >= 500) return '服务器异常，请稍后重试';
    return (
      (
        {
          401: '请求未通过身份验证',
          403: '暂无权限执行此操作',
          404: '请求的资源不存在',
          429: '请求过于频繁，请稍后重试',
        } as Record<number, string>
      )[status ?? 0] ?? '请求失败，请稍后重试'
    );
  }
  return {
    offline: '网络连接已断开，请检查网络',
    network: '网络连接异常，请稍后重试',
    timeout: '请求超时，请稍后重试',
    business: '操作失败，请稍后重试',
    runtime: '页面出现异常，请刷新或稍后重试',
    resource: '页面资源加载失败，请刷新重试',
    cancelled: '请求已取消',
    unknown: '出现异常，请稍后重试',
  }[kind];
}

function record(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};
}

export function normalizeError(value: unknown): AppError {
  if (value instanceof AppError) return value;
  const raw = record(value);
  const response = record(raw.response);
  const code = typeof raw.code === 'string' ? raw.code : undefined;
  if (code === 'ERR_CANCELED' || raw.name === 'AbortError')
    return new AppError('cancelled', undefined, { cause: value });
  if (typeof response.status === 'number')
    return new AppError('http', undefined, { status: response.status, cause: value });
  if (code === 'ECONNABORTED' || code === 'ETIMEDOUT' || code === 'ERR_TIMEOUT') {
    return new AppError('timeout', undefined, { cause: value });
  }
  if (raw.isAxiosError === true && (raw.request || code === 'ERR_NETWORK')) {
    const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
    return new AppError(offline ? 'offline' : 'network', undefined, { cause: value });
  }
  return new AppError(value instanceof Error ? 'runtime' : 'unknown', undefined, { cause: value });
}

export interface HandleOptions {
  silent?: boolean;
}
export type ErrorHandler = (error: unknown, options?: HandleOptions) => AppError;

const silentErrors = new WeakSet<AppError>();
export function silenceError(error: AppError): AppError {
  silentErrors.add(error);
  return error;
}

// Pass the original value to the console so devtools retain its stack and source links.
export function logError(error: AppError): void {
  console.error(error.cause === undefined ? error : error.cause);
}

export function createErrorHandler(options: {
  notify: (message: string) => void;
  report?: (error: AppError) => void | Promise<void>;
  log?: (error: AppError) => void;
  dedupeMs?: number;
  now?: () => number;
}): ErrorHandler {
  const normalized = new WeakMap<object, AppError>();
  const handled = new WeakSet<object>();
  const recent = new Map<string, number>();
  const now = options.now ?? Date.now;
  return (value, handleOptions = {}) => {
    const object = typeof value === 'object' && value !== null ? value : undefined;
    const error = (object && normalized.get(object)) || normalizeError(value);
    if (object) normalized.set(object, error);
    if (handled.has(error)) return error;
    handled.add(error);
    if (error.kind === 'cancelled') return error;
    try {
      (options.log ?? logError)(error);
    } catch {
      /* logging failure must not suppress notification or recurse */
    }
    // Reporting is isolated: a failing reporter must not create an error loop.
    try {
      void Promise.resolve(options.report?.(error)).catch(() => undefined);
    } catch {
      /* isolated */
    }
    if (handleOptions.silent || silentErrors.has(error)) return error;
    const time = now();
    const windowMs = options.dedupeMs ?? 2000;
    for (const [key, timestamp] of recent) if (time - timestamp >= windowMs) recent.delete(key);
    const key = error.kind + ':' + error.status + ':' + error.message;
    if (recent.has(key)) return error;
    recent.set(key, time);
    try {
      options.notify(error.message);
    } catch {
      /* message failure must not recurse */
    }
    return error;
  };
}
