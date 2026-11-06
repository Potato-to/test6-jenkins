import { RequestClient } from '@vben/request';
import { checkBusinessResponse } from '../shared/business-response';
import { createRequestClient, type RequestConfig, type Transport } from '../shared/request-core';
import { authHeaders } from './token';
import { businessBaseURL } from '../shared/api-url';

export function createAxiosTransport(): Transport {
  // Vben 原生 Axios 客户端；不安装预设业务码或 Token 拦截器。
  const client = new RequestClient({ responseReturn: 'raw' });
  return async (url, options) => {
    const response = await client.instance.request({
      url,
      method: options.method,
      params: options.params,
      data: options.data,
      headers: options.headers,
      timeout: options.timeout,
      signal: options.signal,
    });
    return { status: response.status, headers: { ...response.headers }, body: response.data };
  };
}
export function createRequest(config: RequestConfig = {}) {
  return createRequestClient(
    { checkBusiness: checkBusinessResponse, ...config },
    createAxiosTransport(),
  );
}
const config: RequestConfig = {
  headers: authHeaders,
  baseURL: import.meta.env.VITE_API_BASE_URL,
  // Existing template APIs use msg. Preserve message as the preferred public field.
  checkBusiness(body) {
    if (body && typeof body === 'object' && !('message' in body) && 'msg' in body) {
      return checkBusinessResponse({ ...body, message: body.msg });
    }
    return checkBusinessResponse(body);
  },
};
// Generic requests and uploads keep paths relative to the origin.
export const request = createRequest(config);
export const apiRequest = createRequest({
  ...config,
  baseURL: businessBaseURL(import.meta.env.VITE_API_BASE_URL, import.meta.env.VITE_API_PREFIX),
});
