export interface Option {
  label: string;
  value: string | number;
}
export interface Field {
  key: string;
  label: string;
  type?: 'text' | 'password' | 'number' | 'boolean' | 'select';
  required?: boolean;
  multiple?: boolean;
  options?: Option[];
  lookup?: string;
  minLength?: number;
}
export interface Resource {
  key: string;
  title: string;
  endpoint: string;
  id: string;
  fields: Field[];
  tree?: boolean;
}
const text = (key: string, label: string, required = false): Field => ({ key, label, required });
const state: Field = { key: 'disabled', label: '禁用', type: 'boolean' };
const remark = text('remark', '备注');
export const resources: Resource[] = [
  {
    key: 'user',
    title: '用户管理',
    endpoint: '/system/system-user',
    id: 'userId',
    fields: [
      text('username', '账号', true),
      text('nickname', '姓名', true),
      text('telNumber', '手机号'),
      { key: 'password', label: '密码', type: 'password', minLength: 6 },
      {
        key: 'roleIdList',
        label: '角色',
        type: 'select',
        multiple: true,
        lookup: 'role',
        required: true,
      },
      state,
      remark,
    ],
  },
  {
    key: 'role',
    title: '角色管理',
    endpoint: '/system/system-role',
    id: 'roleId',
    fields: [
      text('roleKey', '角色 Key', true),
      text('roleName', '角色名称', true),
      { key: 'menuIdList', label: '菜单', type: 'select', multiple: true, lookup: 'menu' },
      {
        key: 'authorityIdList',
        label: '权限',
        type: 'select',
        multiple: true,
        lookup: 'authority',
      },
      state,
      remark,
    ],
  },
  {
    key: 'menu',
    title: '菜单管理',
    endpoint: '/system/system-menu',
    id: 'menuId',
    tree: true,
    fields: [
      text('menuName', '菜单名称', true),
      {
        key: 'menuType',
        label: '菜单类型',
        type: 'select',
        required: true,
        options: ['DIRECTORY', 'MENU', 'BUTTON', 'EXTERNAL'].map((value) => ({
          label: value,
          value,
        })),
      },
      text('menuRoute', '路由'),
      text('menuIcon', '图标'),
      { key: 'parentId', label: '父级菜单', type: 'select', lookup: 'menu' },
      { key: 'sort', label: '排序', type: 'number' },
      text('link', '外链'),
      text('metaData', '元数据 JSON'),
      state,
      remark,
    ],
  },
  {
    key: 'authority',
    title: '权限管理',
    endpoint: '/system/system-authority',
    id: 'authorityId',
    tree: true,
    fields: [
      text('authorityName', '权限名称', true),
      text('authorityKey', '权限标识', true),
      text('authorityPath', '权限路径'),
      { key: 'parentId', label: '父级权限', type: 'select', lookup: 'authority' },
      { key: 'sort', label: '排序', type: 'number' },
      state,
      remark,
    ],
  },
  {
    key: 'dictionary',
    title: '字典管理',
    endpoint: '/system/system-dictionary-type',
    id: 'dictionaryTypeId',
    fields: [text('typeCode', '字典编码', true), text('typeName', '字典名称', true), state, remark],
  },
  {
    key: 'dictionary-item',
    title: '字典项',
    endpoint: '/system/system-dictionary-item',
    id: 'dictionaryItemId',
    fields: [
      text('typeCode', '字典编码', true),
      text('itemCode', '字典项编码', true),
      text('itemName', '字典项名称', true),
      { key: 'sort', label: '排序', type: 'number' },
      state,
      remark,
    ],
  },
  {
    key: 'template',
    title: '列表模板',
    endpoint: '/template',
    id: 'templateId',
    fields: [
      text('name', '名称', true),
      {
        key: 'sex',
        label: '性别',
        type: 'select',
        options: [
          { label: '男', value: 1 },
          { label: '女', value: 2 },
        ],
      },
      text('introduce', '介绍'),
      text('avatart', '头像地址'),
    ],
  },
];
export function resourceFor(key: string) {
  const result = resources.find((item) => item.key === key);
  if (!result) throw new Error('Unknown resource');
  return result;
}
