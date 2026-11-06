import { request } from '../../services/request';
import type { ApiEnvelope } from '../../services/legacy-http';
import type { UploadApiResult } from './model/uploadModel';
export async function uploadApi(file: File) {
  const form = new FormData();
  form.append('file', file);
  const result = await request.post<ApiEnvelope<UploadApiResult>>(
    import.meta.env.VITE_UPLOAD_URL || '/files/upload',
    form,
    // Match the original uploadFile: override the client's JSON default.
    // Axios supplies the multipart boundary when sending FormData.
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return result.data;
}
