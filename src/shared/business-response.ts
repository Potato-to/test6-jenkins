import type { BusinessFailure } from './request-core';

// 默认后端约定：数字 code === 200 成功，其余情况（包括缺失 code）均失败。
// 原始响应体仍由调用方获取，不自动提取 data。
export function checkBusinessResponse(body: unknown): BusinessFailure | undefined {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) return {};
  const response = body as Record<string, unknown>;
  if (response.code === 200) return undefined;
  return {
    code:
      typeof response.code === 'number' || typeof response.code === 'string'
        ? response.code
        : undefined,
    message: response.message,
  };
}
