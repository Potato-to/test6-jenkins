<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
const route = useRoute();
const source = computed(() => {
  try {
    const value = new URL(String(route.query.url ?? ''));
    const hosts = String(import.meta.env.VITE_FRAME_HOSTS ?? '')
      .split(',')
      .map((host) => host.trim().toLowerCase())
      .filter(Boolean);
    return value.protocol === 'https:' &&
      !value.username &&
      !value.password &&
      hosts.includes(value.hostname.toLowerCase())
      ? value.href
      : '';
  } catch {
    return '';
  }
});
</script>
<template>
  <main class="page-card">
    <iframe
      v-if="source"
      :src="source"
      title="外部页面"
      sandbox="allow-scripts allow-forms"
      referrerpolicy="no-referrer"
      class="h-[70vh] w-full border-0"
    />
    <p v-else>外链不可用，请配置 VITE_FRAME_HOSTS 并使用 HTTPS 地址。目标站点还需允许被嵌入。</p>
  </main>
</template>
