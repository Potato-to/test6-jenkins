import { AppError } from '../shared/errors';
import { acceptSession, type Session } from './auth';

export type AccountFlow = 'register' | 'reset' | 'mobile' | 'qr';
export interface AccountPayload {
  username: string;
  password: string;
  mobile: string;
  sms: string;
}
export interface AccountFlows {
  sendCode?: (mobile: string, flow: AccountFlow) => Promise<void>;
  register?: (payload: AccountPayload) => Promise<void>;
  reset?: (payload: AccountPayload) => Promise<void>;
  mobile?: (payload: AccountPayload) => Promise<Session>;
  qr?: () => Promise<{ imageURL: string }>;
}
let flows: AccountFlows = {};
export function configureAccountFlows(next: AccountFlows) {
  flows = next;
}
function unavailable(): never {
  throw new AppError('business', '该功能尚未接入服务，请配置账号流程适配器');
}
export async function sendCode(mobile: string, flow: AccountFlow) {
  if (!flows.sendCode) unavailable();
  await flows.sendCode(mobile, flow);
}
export async function submitAccountFlow(flow: Exclude<AccountFlow, 'qr'>, payload: AccountPayload) {
  if (flow === 'mobile') {
    if (!flows.mobile) unavailable();
    acceptSession(await flows.mobile(payload));
    return;
  }
  const action = flows[flow];
  if (!action) unavailable();
  await action(payload);
}
export async function loadQr() {
  if (!flows.qr) unavailable();
  return flows.qr();
}
