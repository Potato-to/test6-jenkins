<script setup lang="ts">
import { ref } from 'vue';
import { UiButton, UiInput, UiModal, UiDrawer } from '../ui';
import { uploadApi } from '../api/sys/upload';
const drawer = ref(false);
const open = ref(false);
const content = ref('');
const preview = ref('');
async function copy() {
  await navigator.clipboard.writeText(content.value);
}
function download() {
  const url = URL.createObjectURL(new Blob([content.value], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'example.txt';
  link.click();
  URL.revokeObjectURL(url);
}
async function upload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) await uploadApi(file);
}
function image(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    preview.value = String(reader.result);
  };
  reader.readAsDataURL(file);
}
</script>
<template>
  <main class="page-card">
    <h1 class="mb-4 text-2xl">组件与操作演示</h1>
    <div class="flex flex-col gap-4">
      <UiInput v-model="content" placeholder="输入表单内容" />
      <div class="flex gap-3">
        <UiButton @click="open = true">表单弹窗</UiButton
        ><UiButton @click="drawer = true">表单抽屉</UiButton
        ><UiButton @click="copy">复制文本</UiButton><UiButton @click="download">下载文本</UiButton>
      </div>
      <label>上传文件（需要配置后端）<input type="file" @change="upload" /></label
      ><label>本地图片预览<input type="file" accept="image/*" @change="image" /></label
      ><img v-if="preview" :src="preview" alt="本地图片预览" class="max-h-64 max-w-full" />
    </div>
    <UiModal v-model:open="open" title="表单弹窗"
      ><UiInput v-model="content" /><UiButton class="mt-4" @click="open = false"
        >完成</UiButton
      ></UiModal
    ><UiDrawer v-model:open="drawer" title="表单抽屉"
      ><UiInput v-model="content" /><UiButton class="mt-4" @click="drawer = false"
        >完成</UiButton
      ></UiDrawer
    >
  </main>
</template>
