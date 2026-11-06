import { defHttp } from '@/services/legacy-http';
import { BasicFetchResult, BasicPageParams } from '@/api/model/baseModel';
import { ErrorMessageMode } from '@/services/legacy-http';
import { Role } from '@/api/sys/role';
import { Authority } from '@/api/sys/authority';
import { Menu } from '@/api/sys/menu';

enum Api {
  Login = '/login',
  Logout = '/logout',

  User = '/system/system-user',
  GetUserInfo = '/system/system-user/getCurrentUserInfo',
  GetUserList = '/system/system-user/getList',
}

/** 登录参数 */
export interface LoginParams {
  username: string;
  password: string;
  uuid?: string;
  code?: string;
}

/** 登录返回值 */
export interface LoginResultModel {
  id: number;
  nickname: string;
  username: string;
  accessToken: string;
}

/** 获取用户信息返回值 */
export interface GetUserInfoModel {
  userId: number;
  username: string;
  nickname: string;
  telNumber: string;
  remark: string;
  isRoot: boolean;
  roleList: Role[];
  authorityList: Authority[];
  menuList: Menu[];
}

export interface UpdateUserParams {
  userId: number;
  username: string;
  password: string;
  nickname: string;
  telNumber: string;
  disabled: boolean;
  remark: string;
  roleIdList: number[];
}

export interface User {
  userId: number;
  username: string;
  nickname: string;
  telNumber: string;
  remark: string;
  disabled: boolean;
  roleList: Role[];
  authorityList: Authority[];
  menuList: Menu[];
}

export interface ChangeUserPasswordParams {
  userId: number;
  newPassword: string;
}

export interface GetUserListParams {
  userId?: number;
  username?: string;
  nickname?: string;
  telNumber?: string;
  disabled?: boolean;
}

export interface GetUserListPageParams extends BasicPageParams, GetUserListParams {}

/** 登录 */
export function loginApi(params: LoginParams, mode: ErrorMessageMode = 'modal') {
  return defHttp.post<LoginResultModel>(
    {
      url: Api.Login,
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}

/** 退出登录 */
export function doLogout() {
  return defHttp.delete({ url: Api.Logout });
}

/**
 * @description: 更新用户
 */
export function updateUserApi(data: UpdateUserParams) {
  return defHttp.put<User>({ url: `${Api.User}/${data.userId}`, data });
}

/**
 * @description: 启用
 */
export function enableUserApi(id: number) {
  return defHttp.put<boolean>({ url: `${Api.User}/enable/${id}` });
}

/**
 * @description: 禁用
 */
export function disableUserApi(id: number) {
  return defHttp.put<boolean>({ url: `${Api.User}/disable/${id}` });
}

/**
 * @description: 创建用户
 */
export function createUserApi(data: Omit<User, 'userId'>) {
  return defHttp.post<User>({ url: Api.User, data });
}

/**
 * @description: 修改用户密码
 */
export function changeUserPasswordApi(data: ChangeUserPasswordParams) {
  return defHttp.post<boolean>({ url: `${Api.User}/changeTargetUserPassword`, data });
}

/**
 * @description: 获取当前用户信息
 */
export function getUserInfo() {
  return defHttp.get<GetUserInfoModel>({ url: Api.GetUserInfo });
}

/**
 * @description: 获取用户列表 分页
 */
export function getUserListPageApi(params: GetUserListPageParams) {
  return defHttp.get<BasicFetchResult<User>>({ url: Api.User, params });
}

/**
 * @description: 获取用户列表 不分页
 */
export function getUserListApi(params: GetUserListParams) {
  return defHttp.get<User[]>({ url: Api.GetUserList, params });
}

/**
 * @description: 获取用户详情
 */
export function getUserDetailApi(id: number) {
  return defHttp.get<User>({ url: `${Api.User}/${id}` });
}

/**
 * @description: 删除用户
 */
export function deleteUserByIdApi(id: number) {
  return defHttp.delete<boolean>({ url: `${Api.User}/${id}` });
}
