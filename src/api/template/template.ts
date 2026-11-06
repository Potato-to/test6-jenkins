import { defHttp } from '@/services/legacy-http';
import { BasicFetchResult, BasicPageParams } from '@/api/model/baseModel';

enum Api {
  GetTemplateList = '/template/getList',
  UpdateTemplate = '/template/update',
  AddTemplate = '/template/add',
  DeleteTemplate = '/template/delete/',
  GetTemplateSelectList = '/template/getSelectList',
}

/**
 * @description: 获取模板数据列表参数类型
 */
export interface GetTemplateListParams extends BasicPageParams {
  name?: string;
  sex?: number;
  createStartTime?: string;
  createEndTime?: string;
}

/**
 * @description: 获取模板数据列表单个子项类型
 */
export interface TemplateItem {
  templateId: string;
  name: string;
  sex: number;
  createTime: string;
  introduce: string;
  avatart: string;
}

/**
 * @description: 获取模板数据列表响应体类型
 */
export type GetTemplateListResult = BasicFetchResult<TemplateItem>;

/**
 * @description: 更新模板数据参数类型
 */
export interface UpdateTemplateParams {
  templateId: string;
  name?: string;
  sex?: number;
  introduce?: string;
  avatart?: string;
}

/**
 * @description: 添加模板数据响应体类型
 */
export interface AddTemplateParams {
  name: string;
  sex: number;
  introduce: string;
  avatart: string;
}

/**
 * @description: 获取下拉列表数据响应体类型
 */
export type GetTemplateSelectListResult = {
  label: string;
  value: number;
}[];

/**
 * @description: 获取模板数据列表
 */
export const getTemplateListApi = (params: GetTemplateListParams) => {
  return defHttp.get<GetTemplateListResult>({ url: Api.GetTemplateList, params });
};

/**
 * @description: 更新模板数据
 */
export const updateTemplateApi = (params: UpdateTemplateParams) => {
  return defHttp.put<TemplateItem>({ url: Api.UpdateTemplate, params });
};
/**
 * @description: 添加模板数据
 */
export const addTemplateApi = (params: AddTemplateParams) => {
  return defHttp.post<TemplateItem>({ url: Api.AddTemplate, params });
};
/**
 * @description: 删除模板数据
 */
export const deleteTemplateApi = (id: number) => {
  return defHttp.delete<boolean>({ url: `${Api.DeleteTemplate}${id}` });
};
/**
 * @description: 获取下拉列表数据
 */
export const getTemplateSelectListApi = () => {
  return defHttp.get<GetTemplateSelectListResult>({ url: Api.GetTemplateSelectList });
};
