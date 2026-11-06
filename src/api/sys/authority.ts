import { defHttp } from '@/services/legacy-http';
import { BasicPageParams, BasicFetchResult } from '@/api/model/baseModel';

enum Api {
  Authority = '/system/system-authority',
  GetAuthorityList = '/system/system-authority/getList',
  GetAuthorityTree = '/system/system-authority/getAuthorityTree',
  GetCurrentUserAuthorityTree = '/system/system-authority/getCurrentUserAuthorityTree',
}

/**
 * @description: 权限实体
 */
export interface Authority {
  /** 权限id */
  authorityId: number;
  /** 权限名称 */
  authorityName: string;
  /** 权限key */
  authorityKey: string;
  /** 权限路径 */
  authorityPath: string;
  /** 父级id */
  parentId: number;
  /** 排序 */
  sort: number;
  /** 备注 */
  remark: string;
  /** 是否禁用(1是,0否) */
  disabled: boolean;
  /** 子集 */
  children?: Authority[];
  /** 创建人id */
  createUserId?: number;
  /** 创建时间 */
  createTime?: string;
  /** 更新人id */
  updateUserId?: number;
  /** 更新时间 */
  updateTime?: string;
}

/**
 * @description: 更新权限参数
 */
export interface UpdateAuthorityParams {
  authorityId: number;
  authorityName: string;
  authorityKey: string;
  authorityPath: string;
  parentId: number;
  sort: number;
  remark: string;
  disabled: boolean;
}

/**
 * @description: 获取权限列表参数
 */
export interface GetAuthorityListParams {
  authorityId?: number;
  authorityKey?: string;
  authorityPath?: string;
  authorityName?: string;
  parentId?: number;
  remark?: string;
  disabled?: boolean | 1 | 0;
}

/**
 * @description: 获取权限列表分页参数
 */
export interface GetAuthorityListPageParams extends BasicPageParams, GetAuthorityListParams {}

/**
 * @description: 获取权限详情
 */
export function getAuthorityDetailApi(id: number) {
  return defHttp.get<Authority>({ url: `${Api.Authority}/${id}` });
}

/**
 * @description: 更新权限
 */
export function updateAuthorityApi(data: UpdateAuthorityParams) {
  return defHttp.put<Authority>({ url: `${Api.Authority}/${data.authorityId}`, data });
}

/**
 * @description: 删除权限
 */
export function deleteAuthorityApi(id: number) {
  return defHttp.delete<boolean>({ url: `${Api.Authority}/${id}` });
}

/**
 * @description: 获取权限列表（分页）
 */
export function getAuthorityListPageApi(params: GetAuthorityListPageParams) {
  return defHttp.get<BasicFetchResult<Authority>>({ url: Api.Authority, params });
}

/**
 * @description: 获取权限列表（不分页）
 */
export const getAuthorityListApi = (params?: GetAuthorityListParams) => {
  return defHttp.get<Authority[]>({ url: Api.GetAuthorityList, params });
};

/**
 * @description: 创建权限
 */
export function createAuthorityApi(
  data: Omit<
    Authority,
    'authorityId' | 'createUserId' | 'createTime' | 'updateUserId' | 'updateTime' | 'children'
  >,
) {
  return defHttp.post<Authority>({ url: Api.Authority, data });
}

/**
 * @description: 获取权限树
 */
export const getAuthorityTreeApi = (params?: GetAuthorityListParams) => {
  return defHttp.get<Authority[]>({ url: Api.GetAuthorityTree, params });
};

/**
 * @description: 获取当前用户权限树
 */
export function getCurrentUserAuthorityTreeApi() {
  return defHttp.get<Authority[]>({ url: Api.GetCurrentUserAuthorityTree });
}

/**
 * @description: 启用权限
 */
export function enableAuthorityApi(id: number) {
  return defHttp.put<boolean>({ url: `${Api.Authority}/enable/${id}` });
}

/**
 * @description: 禁用权限
 */
export function disableAuthorityApi(id: number) {
  return defHttp.put<boolean>({ url: `${Api.Authority}/disable/${id}` });
}
