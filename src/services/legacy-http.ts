import { apiRequest as request } from './request';
import type { RequestOptions } from '../shared/request-core';
export type ErrorMessageMode = 'none' | 'message' | 'modal';
export interface ApiEnvelope<T> {
  code: number;
  message?: string;
  msg?: string;
  data: T;
}
interface LegacyConfig {
  url: string;
  params?: object;
  data?: unknown;
}
interface LegacyOptions {
  errorMessageMode?: ErrorMessageMode;
}
async function call<T>(
  method: NonNullable<RequestOptions['method']>,
  config: LegacyConfig,
  options?: LegacyOptions,
): Promise<T> {
  const body = await request.request<ApiEnvelope<T>>(config.url, {
    method,
    params:
      method === 'GET' || method === 'DELETE'
        ? (config.params as RequestOptions['params'])
        : undefined,
    data: method === 'POST' || method === 'PUT' ? (config.data ?? config.params) : undefined,
    silent: options?.errorMessageMode === 'none',
  });
  // v2 API functions returned data directly. Only these migrated API functions unwrap it.
  return body.data;
}
export const defHttp = {
  get: <T>(config: LegacyConfig, options?: LegacyOptions) => call<T>('GET', config, options),
  post: <T>(config: LegacyConfig, options?: LegacyOptions) => call<T>('POST', config, options),
  put: <T>(config: LegacyConfig, options?: LegacyOptions) => call<T>('PUT', config, options),
  delete: <T>(config: LegacyConfig, options?: LegacyOptions) => call<T>('DELETE', config, options),
};
