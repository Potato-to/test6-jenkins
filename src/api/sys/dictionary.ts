import { defHttp } from '@/services/legacy-http';
import { BasicPageParams, BasicFetchResult } from '@/api/model/baseModel';

enum Api {
  DictionaryType = '/system/system-dictionary-type',
  GetDictionaryTypeList = '/system/system-dictionary-type/getList',
  GetDictionaryTypeItemListById = '/system/system-dictionary-type/getDictionaryItemListById/',

  DictionaryItem = '/system/system-dictionary-item',
  GetDictionaryItemList = '/system/system-dictionary-item/getList',
}

export interface UpdateDictionaryTypeParams {
  dictionaryTypeId: number;
  typeCode: string;
  typeName: string;
  remark: string;
  disabled: boolean;
}

export interface DictionaryType {
  dictionaryTypeId: number;
  typeCode: string;
  typeName: string;
  remark: string;
  disabled: boolean;
}

export interface GetDictionaryTypeListParams {
  dictionaryTypeId?: number;
  typeCode?: string;
  typeName?: string;
  disabled?: boolean;
}

export interface GetDictionaryTypeListPageParams
  extends BasicPageParams,
    GetDictionaryTypeListParams {}

export interface UpdateDictionaryItemParams {
  dictionaryItemId: number;
  typeCode: string;
  itemCode: string;
  itemName: string;
  sort: number;
  remark: string;
  disabled: boolean;
}

export interface DictionaryItem {
  dictionaryItemId: number;
  typeCode: string;
  itemCode: string;
  itemName: string;
  sort: number;
  remark: string;
  disabled: boolean;
}

export interface GetDictionaryItemListParams {
  dictionaryItemId?: number;
  typeCode?: string;
  itemCode?: string;
  itemName?: string;
  disabled?: boolean;
}

export interface GetDictionaryItemListPageParams
  extends BasicPageParams,
    GetDictionaryItemListParams {}

/**
 * @description: 获取字典类型详情
 */
export function getDictionaryTypeDetailApi(id: number) {
  return defHttp.get<DictionaryType>({ url: `${Api.DictionaryType}/${id}` });
}

/**
 * @description: 更新字典类型
 */
export function updateDictionaryTypeApi(data: UpdateDictionaryTypeParams) {
  return defHttp.put<DictionaryType>({
    url: `${Api.DictionaryType}/${data.dictionaryTypeId}`,
    data,
  });
}

/**
 * @description: 删除字典类型
 */
export function deleteDictionaryTypeByIdApi(id: number) {
  return defHttp.delete<boolean>({ url: `${Api.DictionaryType}/${id}` });
}

/**
 * @description: 获取字典类型列表
 */
export function getDictionaryTypeListPageApi(params: GetDictionaryTypeListPageParams) {
  return defHttp.get<BasicFetchResult<DictionaryType>>({
    url: Api.DictionaryType,
    params,
  });
}

/**
 * @description: 创建字典类型
 */
export function createDictionaryTypeApi(data: Omit<DictionaryType, 'dictionaryTypeId'>) {
  return defHttp.post<DictionaryType>({ url: Api.DictionaryType, data });
}

/**
 * @description: 获取字典类型列表，不分页
 */
export const getDictionaryTypeListApi = (params?: GetDictionaryTypeListParams) => {
  return defHttp.get<DictionaryType[]>({ url: Api.GetDictionaryTypeList, params });
};

/**
 * @description: 根据字典类型获取字典项列表
 */
export function getDictionaryTypeItemListByIdApi(params: { dictionaryTypeId: number }) {
  return defHttp.get<DictionaryItem[]>({
    url: `${Api.GetDictionaryTypeItemListById}${params.dictionaryTypeId}`,
  });
}

/**
 * @description: 启用字典类型
 */
export function enableDictionaryTypeApi(id: number) {
  return defHttp.put<boolean>({ url: `${Api.DictionaryType}/enable/${id}` });
}

/**
 * @description: 禁用字典类型
 */
export function disableDictionaryTypeApi(id: number) {
  return defHttp.put<boolean>({ url: `${Api.DictionaryType}/disable/${id}` });
}

/**
 * @description: 获取字典项详情
 */
export function getDictionaryItemDetailApi(id: number) {
  return defHttp.get<DictionaryItem>({ url: `${Api.DictionaryItem}/${id}` });
}

/**
 * @description: 更新字典项
 */
export function updateDictionaryItemApi(data: UpdateDictionaryItemParams) {
  return defHttp.put<DictionaryItem>({
    url: `${Api.DictionaryItem}/${data.dictionaryItemId}`,
    data,
  });
}

/**
 * @description: 创建字典项
 */
export function createDictionaryItemApi(data: Omit<DictionaryItem, 'dictionaryItemId'>) {
  return defHttp.post<DictionaryItem>({ url: Api.DictionaryItem, data });
}

/**
 * @description: 获取字典项列表，不分页
 */
export const getDictionaryItemListApi = (params: GetDictionaryItemListParams) => {
  return defHttp.get<DictionaryItem[]>({ url: Api.GetDictionaryItemList, params });
};

/**
 * @description: 获取字典项列表
 */
export function getDictionaryItemListPageApi(params: GetDictionaryItemListPageParams) {
  return defHttp.get<BasicFetchResult<DictionaryItem>>({
    url: Api.DictionaryItem,
    params,
  });
}

/**
 * @description: 删除字典项
 */
export function deleteDictionaryItemByIdApi(id: number) {
  return defHttp.delete<boolean>({ url: `${Api.DictionaryItem}/${id}` });
}

/**
 * @description: 启用字典项
 */
export function enableDictionaryItemApi(id: number) {
  return defHttp.put<boolean>({ url: `${Api.DictionaryItem}/enable/${id}` });
}

/**
 * @description: 禁用字典项
 */
export function disableDictionaryItemApi(id: number) {
  return defHttp.put<boolean>({ url: `${Api.DictionaryItem}/disable/${id}` });
}
