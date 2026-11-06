<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { safeRedirect } from '../auth-navigation';
const route = useRoute();
const router = useRouter();
onMounted(async () => {
  const target = safeRedirect(route.query.to);
  await router.replace(target.split('?')[0]?.replace(/\/+$/, '') === '/redirect' ? '/' : target);
});
</script>
<template><main class="page-card">正在跳转…</main></template>
