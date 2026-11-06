import { shallowRef } from 'vue';
import type { AppError } from '../shared/errors';
export const errors = shallowRef<
  { time: string; kind: string; message: string; status?: number; code?: string | number }[]
>([]);
// Do not retain response bodies, credentials, stacks, or request headers in the demo log.
export function recordError(error: AppError) {
  errors.value = [
    {
      time: new Date().toISOString(),
      kind: error.kind,
      message: error.message,
      status: error.status,
      code: error.code,
    },
    ...errors.value,
  ];
}
