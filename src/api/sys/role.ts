import { defHttp } from '@/services/legacy-http';
import { BasicPageParams, BasicFetchResult } from '@/api/model/baseModel';
import { Menu } from '@/api/sys/menu';
import { Authority } from '@/api/sys/authority';

enum Api {
  Role = '/system/system-role',
  GetRoleList = '/system/system-role/getList',
  UpdateRoleMenuList = '/system/system-role/updateRoleMenuList',
}

/**
 * @description: 角色实体（VO）
 */
export interface Role {
  /** 角色id */
  roleId: number;
  /** 角色key */
  roleKey: string;
  /** 角色名字 */
  roleName: string;
  /** 备注 */
  remark?: string;
  /** 是否禁用(1是,0否) */
  disabled: boolean;
  /** 权限列表 */
  authorityList?: Authority[];
  /** 权限的id列表 */
  authorityIdList?: string[];
  /** 菜单的id列表 */
  menuIdList?: string[];
  /** 菜单列表 */
  menuList?: Menu[];
  /** 创建人id */
  createUserId?: number;
  /** 创建人用户名 */
  createUserName?: string;
  /** 创建时间 */
  createTime?: string;
  /** 更新人id */
  updateUserId?: number;
  /** 更新人用户名 */
  updateUserName?: string;
  /** 更新时间 */
  updateTime?: string;
}

/**
 * @description: 创建/更新角色参数（DTO）
 */
export interface RoleDTO {
  /** 角色id（更新时必填） */
  roleId?: number;
  /** 角色key */
  roleKey: string;
  /** 角色名字 */
  roleName: string;
  /** 备注 */
  remark?: string;
  /** 是否禁用(是,否) */
  disabled?: boolean;
  /** 权限的id列表 */
  authorityIdList?: number[];
  /** 菜单的id列表 */
  menuIdList?: number[];
}

/**
 * @description: 更新角色参数
 */
export interface UpdateRoleParams extends RoleDTO {
  roleId: number;
}

/**
 * @description: 获取角色列表参数
 */
export interface GetRoleListParams {
  roleId?: number;
  roleKey?: string;
  roleName?: string;
  disabled?: boolean;
  remark?: string;
}

/**
 * @description: 获取角色列表分页参数
 */
export interface GetRoleListPageParams extends BasicPageParams, GetRoleListParams {}

/**
 * @description: 获取角色详情
 */
export function getRoleDetailApi(id: number) {
  return defHttp.get<Role>({ url: `${Api.Role}/${id}` });
}

/**
 * @description: 更新角色
 */
export function updateRoleApi(data: UpdateRoleParams) {
  return defHttp.put<Role>({ url: `${Api.Role}/${data.roleId}`, data });
}

/**
 * @description: 删除角色
 */
export function deleteRoleApi(id: number, confirmed?: boolean) {
  return defHttp.delete<boolean>({ url: `${Api.Role}/${id}`, params: { confirmed } });
}

/**
 * @description: 获取角色列表（分页）
 */
export function getRoleListPageApi(params: GetRoleListPageParams) {
  return defHttp.get<BasicFetchResult<Role>>({ url: Api.Role, params });
}

/**
 * @description: 获取角色列表（不分页）
 */
export const getRoleListApi = (params?: GetRoleListParams) => {
  return defHttp.get<Role[]>({ url: Api.GetRoleList, params });
};

/**
 * @description: 创建角色
 */
export function createRoleApi(data: Omit<RoleDTO, 'roleId'>) {
  return defHttp.post<Role>({ url: Api.Role, data });
}

/**
 * @description: 更新角色菜单关联
 */
export function updateRoleMenuListApi(data: RoleDTO) {
  return defHttp.put<Role>({ url: Api.UpdateRoleMenuList, data });
}

/**
 * @description: 启用角色
 */
export function enableRoleApi(id: number) {
  return defHttp.put<boolean>({ url: `${Api.Role}/enable/${id}` });
}

/**
 * @description: 禁用角色
 */
export function disableRoleApi(id: number) {
  return defHttp.put<boolean>({ url: `${Api.Role}/disable/${id}` });
}
