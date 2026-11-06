import { defHttp } from '@/services/legacy-http';
import { BasicPageParams, BasicFetchResult } from '@/api/model/baseModel';

enum Api {
  Menu = '/system/system-menu',
  GetMenuList = '/system/system-menu/getList',
  GetMenuTree = '/system/system-menu/getMenuTree',
  GetCurrentUserMenuTree = '/system/system-menu/getCurrentUserMenuTree',
}

/**
 * @description: 菜单类型
 */
export enum MenuType {
  /** 目录 */
  DIRECTORY = 'DIRECTORY',
  /** 菜单 */
  MENU = 'MENU',
  /** 按钮 */
  BUTTON = 'BUTTON',
  /** 外链 */
  EXTERNAL = 'EXTERNAL',
}

/**
 * @description: 菜单实体
 */
export interface Menu {
  /** 菜单id */
  menuId: number;
  /** 菜单名字 */
  menuName: string;
  /** 菜单类型 */
  menuType: MenuType;
  /** 菜单路由 */
  menuRoute: string;
  /** 菜单图标 */
  menuIcon: string;
  /** 父级id */
  parentId: number;
  /** 父级名称 */
  parentName?: string;
  /** 排序 */
  sort: number;
  /** 外链 */
  link?: string;
  /** 元数据 */
  metaData?: string;
  /** 备注 */
  remark?: string;
  /** 是否禁用(1是,0否) */
  disabled: boolean;
  /** 子级列表 */
  children?: Menu[];
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
 * @description: 更新菜单参数
 */
export interface UpdateMenuParams {
  menuId: number;
  menuName: string;
  menuType: MenuType;
  menuRoute: string;
  menuIcon: string;
  parentId: number;
  sort: number;
  link: string;
  metaData?: string;
  remark?: string;
  disabled: boolean;
}

/**
 * @description: 获取菜单列表参数
 */
export interface GetMenuListParams {
  menuId?: number;
  menuName?: string;
  menuType?: MenuType;
  menuRoute?: string;
  menuIcon?: string;
  parentId?: number;
  link?: string;
  remark?: string;
  disabled?: boolean;
}

/**
 * @description: 获取菜单列表分页参数
 */
export interface GetMenuListPageParams extends BasicPageParams, GetMenuListParams {}

/**
 * @description: 获取菜单详情
 */
export function getMenuDetailApi(id: number) {
  return defHttp.get<Menu>({ url: `${Api.Menu}/${id}` });
}

/**
 * @description: 更新菜单
 */
export function updateMenuApi(data: UpdateMenuParams) {
  return defHttp.put<Menu>({ url: `${Api.Menu}/${data.menuId}`, data });
}

/**
 * @description: 删除菜单
 */
export function deleteMenuApi(id: number) {
  return defHttp.delete<boolean>({ url: `${Api.Menu}/${id}` });
}

/**
 * @description: 获取菜单列表（分页）
 */
export function getMenuListPageApi(params: GetMenuListPageParams) {
  return defHttp.get<BasicFetchResult<Menu>>({ url: Api.Menu, params });
}

/**
 * @description: 获取菜单列表（不分页）
 */
export const getMenuListApi = (params?: GetMenuListParams) => {
  return defHttp.get<Menu[]>({ url: Api.GetMenuList, params });
};

/**
 * @description: 创建菜单
 */
export function createMenuApi(
  data: Omit<
    Menu,
    | 'menuId'
    | 'createUserId'
    | 'createTime'
    | 'updateUserId'
    | 'updateTime'
    | 'children'
    | 'parentName'
  >,
) {
  return defHttp.post<Menu>({ url: Api.Menu, data });
}

/**
 * @description: 获取菜单树
 */
export const getMenuTreeApi = (params?: GetMenuListParams) => {
  return defHttp.get<Menu[]>({ url: Api.GetMenuTree, params });
};

/**
 * @description: 获取当前用户菜单树
 */
export function getCurrentUserMenuTreeApi() {
  return defHttp.get<Menu[]>({ url: Api.GetCurrentUserMenuTree });
}

/**
 * @description: 启用菜单
 */
export function enableMenuApi(id: number) {
  return defHttp.put<boolean>({ url: `${Api.Menu}/enable/${id}` });
}

/**
 * @description: 禁用菜单
 */
export function disableMenuApi(id: number) {
  return defHttp.put<boolean>({ url: `${Api.Menu}/disable/${id}` });
}
