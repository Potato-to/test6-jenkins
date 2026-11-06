import { message } from 'ant-design-vue';
export { Button as UiButton } from 'ant-design-vue';
export function showMessage(text: string) {
  void message.error(text);
}

export { default as UiInput } from './LoginInput.vue';
export { default as UiPassword } from './LoginPassword.vue';

export { UiDataTable, UiModal, UiSelect, UiSwitch, UiDrawer } from './admin-components';
