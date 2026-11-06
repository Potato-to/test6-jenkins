// API authentication keeps the token in memory; refreshing requires login again.
let token = '';
export function setToken(value: string) {
  token = value;
}
export function authHeaders(): Record<string, string> {
  return token ? { Authorization: 'Bearer ' + token } : {};
}
