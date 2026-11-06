import { apiRequest as request } from '../../services/request';
import type { ApiEnvelope } from '../../services/legacy-http';
import type { Resource } from './schema';
export type Row = Record<string, unknown>;
export interface Page {
  records: Row[];
  total: number;
}
export const demoMode = import.meta.env.DEV && import.meta.env.VITE_DEMO_MODE !== 'false';
// Demo data is local only. Real API failures never fall back to fabricated success.
const cache = new Map<string, Row[]>();
let nextDemoId = Date.now();
function local(resource: Resource): Row[] {
  if (!cache.has(resource.key)) {
    let stored: Row[] = [];
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem('test6:' + resource.key) || '[]');
      if (Array.isArray(parsed)) stored = parsed.filter((v) => v && typeof v === 'object');
    } catch {
      /* fresh demo */
    }
    cache.set(resource.key, stored);
  }
  return cache.get(resource.key)!;
}
function persist(resource: Resource) {
  localStorage.setItem('test6:' + resource.key, JSON.stringify(local(resource)));
}
function idUrl(resource: Resource, id: unknown) {
  return resource.endpoint + '/' + encodeURIComponent(String(id));
}
export const repository = {
  async detail(resource: Resource, row: Row): Promise<Row> {
    if (demoMode || resource.key === 'template') return { ...row };
    const result = await request.get<ApiEnvelope<Row>>(idUrl(resource, row[resource.id]));
    return result.data;
  },
  async list(
    resource: Resource,
    page: number,
    size: number,
    query: Record<string, string>,
  ): Promise<Page> {
    if (demoMode) {
      const rows = local(resource).filter((row) =>
        Object.entries(query).every(([k, v]) => !v || String(row[k] ?? '').includes(v)),
      );
      return { records: rows.slice((page - 1) * size, page * size), total: rows.length };
    }
    const url = resource.key === 'template' ? resource.endpoint + '/getList' : resource.endpoint;
    const result = await request.get<ApiEnvelope<Page>>(url, { params: { page, size, ...query } });
    return result.data;
  },
  async save(resource: Resource, row: Row, isNew: boolean) {
    if (demoMode) {
      const rows = local(resource);
      const copy = { ...row };
      delete copy.password;
      if (isNew) {
        nextDemoId =
          rows.reduce((id, item) => Math.max(id, Number(item[resource.id]) || 0), nextDemoId) + 1;
        copy[resource.id] = nextDemoId;
        rows.push(copy);
      } else {
        const index = rows.findIndex((item) => item[resource.id] === copy[resource.id]);
        if (index < 0) throw new Error('Missing record');
        rows[index] = copy;
      }
      persist(resource);
      return;
    }
    if (resource.key === 'template') {
      await request.request(resource.endpoint + (isNew ? '/add' : '/update'), {
        method: isNew ? 'POST' : 'PUT',
        data: row,
      });
      return;
    }
    await request.request(isNew ? resource.endpoint : idUrl(resource, row[resource.id]), {
      method: isNew ? 'POST' : 'PUT',
      data: row,
    });
  },
  async remove(resource: Resource, row: Row) {
    if (demoMode) {
      cache.set(
        resource.key,
        local(resource).filter((item) => item[resource.id] !== row[resource.id]),
      );
      persist(resource);
      return;
    }
    await request.delete(
      resource.key === 'template'
        ? resource.endpoint + '/delete/' + encodeURIComponent(String(row[resource.id]))
        : idUrl(resource, row[resource.id]),
    );
  },
  async toggle(resource: Resource, row: Row) {
    if (demoMode) {
      await this.save(resource, { ...row, disabled: !row.disabled }, false);
      return;
    }
    await request.put(
      resource.endpoint +
        '/' +
        (row.disabled ? 'enable' : 'disable') +
        '/' +
        encodeURIComponent(String(row[resource.id])),
    );
  },
  async options(resource: Resource): Promise<Row[]> {
    if (demoMode) return local(resource);
    const result = await request.get<ApiEnvelope<Row[]>>(resource.endpoint + '/getList');
    return result.data;
  },
};
