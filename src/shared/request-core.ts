import { AppError, normalizeError, silenceError } from './errors';

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  params?: Record<string, string | number | boolean | undefined>;
  data?: unknown;
  headers?: Record<string, string>;
  timeout?: number;
  silent?: boolean;
  signal?: AbortSignal;
}
export interface ResponseContext {
  status: number;
  headers: Record<string, unknown>;
}
export interface BusinessFailure {
  message?: unknown;
  code?: string | number;
}
export interface RequestConfig {
  baseURL?: string;
  timeout?: number;
  headers?:
    | Record<string, string>
    | (() => Record<string, string> | Promise<Record<string, string>>);
  checkBusiness?: (body: unknown, response: ResponseContext) => BusinessFailure | null | undefined;
  transformResponse?: (body: unknown, response: ResponseContext) => unknown | Promise<unknown>;
}
export type Transport = (
  url: string,
  options: RequestOptions,
) => Promise<ResponseContext & { body: unknown }>;

export function createRequestClient(config: RequestConfig, transport: Transport) {
  async function request<T = unknown>(url: string, options: RequestOptions = {}): Promise<T> {
    try {
      if (options.signal?.aborted) throw new AppError('cancelled');
      const headers =
        typeof config.headers === 'function' ? await config.headers() : config.headers;
      const absolute = /^(?:https?:)?\/\//i.test(url);
      const target =
        absolute || !config.baseURL
          ? url
          : config.baseURL.replace(/\/$/, '') + '/' + url.replace(/^\//, '');
      const response = await transport(target, {
        ...options,
        method: options.method ?? 'GET',
        timeout: options.timeout ?? config.timeout ?? 15000,
        headers: { ...headers, ...options.headers },
      });
      if (response.status < 200 || response.status >= 300) {
        throw new AppError('http', undefined, { status: response.status });
      }
      const failure = config.checkBusiness?.(response.body, response);
      if (failure)
        throw new AppError(
          'business',
          typeof failure.message === 'string' ? failure.message : undefined,
          { code: failure.code },
        );
      return (
        config.transformResponse
          ? await config.transformResponse(response.body, response)
          : response.body
      ) as T;
    } catch (error) {
      // Only normalize here. Vue / unhandledrejection handles errors that escape
      // the caller; an ordinary catch must not produce a global message.
      const normalized = normalizeError(error);
      throw options.silent ? silenceError(normalized) : normalized;
    }
  }
  return {
    request,
    get: <T = unknown>(url: string, options?: RequestOptions) =>
      request<T>(url, { ...options, method: 'GET' }),
    post: <T = unknown>(url: string, data?: unknown, options?: RequestOptions) =>
      request<T>(url, { ...options, data, method: 'POST' }),
    put: <T = unknown>(url: string, data?: unknown, options?: RequestOptions) =>
      request<T>(url, { ...options, data, method: 'PUT' }),
    delete: <T = unknown>(url: string, options?: RequestOptions) =>
      request<T>(url, { ...options, method: 'DELETE' }),
  };
}
