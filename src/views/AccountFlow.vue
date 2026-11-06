<script setup lang="ts">
import { ref, reactive, onUnmounted } from 'vue';
import { UiButton, UiInput, UiPassword, UiSwitch } from '../ui';
import { sendCode, submitAccountFlow, loadQr, type AccountFlow } from '../services/account-flows';
const props = defineProps<{ flow: AccountFlow }>();
const titles = { register: '注册账号', reset: '找回密码', mobile: '短信登录', qr: '扫码登录' };
defineEmits<{ back: []; authenticated: [] }>();
const model = reactive({ username: '', password: '', mobile: '', sms: '' });
const confirm = ref('');
const policy = ref(false);
const message = ref('');
const loading = ref(false);
const seconds = ref(0);
const imageURL = ref('');
let timer: ReturnType<typeof setInterval> | undefined;
onUnmounted(() => clearInterval(timer));
function validPhone() {
  if (!/^\+?[0-9]{6,15}$/.test(model.mobile)) {
    message.value = '请输入有效手机号';
    return false;
  }
  return true;
}
async function code() {
  if (loading.value || seconds.value || !validPhone()) return;
  loading.value = true;
  try {
    await sendCode(model.mobile, props.flow);
    seconds.value = 60;
    timer = setInterval(() => {
      seconds.value--;
      if (!seconds.value) clearInterval(timer);
    }, 1000);
  } finally {
    loading.value = false;
  }
}
async function submit() {
  if (loading.value || props.flow === 'qr') return false;
  message.value = '';
  if (!validPhone() || !model.sms.trim()) {
    message.value ||= '请填写验证码';
    return false;
  }
  if (props.flow !== 'mobile') {
    if (props.flow === 'register' && !model.username.trim()) {
      message.value = '请填写账号';
      return false;
    }
    if (model.password.length < 6 || model.password !== confirm.value) {
      message.value = '密码至少6位，且两次输入一致';
      return false;
    }
    if (props.flow === 'register' && !policy.value) {
      message.value = '请先同意协议';
      return false;
    }
  }
  loading.value = true;
  try {
    await submitAccountFlow(props.flow, { ...model });
    model.password = '';
    confirm.value = '';
    message.value = '操作完成，请返回登录';
    return props.flow === 'mobile';
  } finally {
    loading.value = false;
  }
}
async function qr() {
  loading.value = true;
  try {
    const result = await loadQr();
    if (!/^https:\/\//i.test(result.imageURL)) {
      message.value = '二维码图片需使用 HTTPS 地址';
      return;
    }
    imageURL.value = result.imageURL;
  } finally {
    loading.value = false;
  }
}
</script>
<template>
  <section class="flex flex-col gap-4">
    <h2 class="text-xl font-bold">{{ titles[flow] }}</h2>
    <p class="text-sm text-slate-500">
      沿用原模板表单入口，实际服务需通过 configureAccountFlows 接入。
    </p>
    <template v-if="flow !== 'qr'">
      <UiInput
        v-if="flow === 'register'"
        v-model="model.username"
        placeholder="账号"
        :disabled="loading"
      />
      <UiInput v-model="model.mobile" placeholder="手机号" :disabled="loading" />
      <UiInput v-model="model.sms" placeholder="验证码" :disabled="loading" />
      <UiButton :disabled="loading || seconds > 0" @click="code">{{
        seconds ? seconds + 's' : '获取验证码'
      }}</UiButton>
      <UiPassword
        v-if="flow !== 'mobile'"
        v-model="model.password"
        placeholder="密码（至少6位）"
        :disabled="loading"
      />
      <UiPassword
        v-if="flow !== 'mobile'"
        v-model="confirm"
        placeholder="确认密码"
        :disabled="loading"
      />
      <label v-if="flow === 'register'" class="flex gap-2"
        ><UiSwitch
          v-model="policy"
          :disabled="loading"
        />同意用户协议与隐私政策（上线前配置实际协议）</label
      >
      <UiButton
        :disabled="loading"
        @click="
          async () => {
            if (await submit()) $emit('authenticated');
          }
        "
        >提交</UiButton
      >
    </template>
    <template v-else
      ><UiButton :disabled="loading" @click="qr">获取二维码</UiButton
      ><img v-if="imageURL" :src="imageURL" alt="登录二维码" class="h-48 w-48" />
      <p>扫描后的认证结果由接入方处理；成功后调用 acceptSession。</p></template
    >
    <p v-if="message" role="status">{{ message }}</p>
    <UiButton :disabled="loading" @click="$emit('back')">返回账号登录</UiButton>
  </section>
</template>
