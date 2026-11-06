<script setup lang="ts">
import { errors } from '../services/error-log';
import { UiButton } from '../ui';
</script>
<template>
  <main class="page-card">
    <h1 class="mb-4 text-2xl">错误日志</h1>
    <UiButton @click="errors = []">清空</UiButton>
    <p class="my-4">记录本次运行中经过全局错误处理的全部错误，刷新后清空。</p>
    <ul>
      <li v-for="(entry, index) in errors" :key="index" class="my-3">
        {{ entry.time }} · {{ entry.kind }} · {{ entry.message }}
        {{ entry.status || entry.code || '' }}
      </li>
    </ul>
  </main>
</template>
