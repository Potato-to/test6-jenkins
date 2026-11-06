<script setup lang="ts">
import { Input } from 'ant-design-vue';
defineOptions({ inheritAttrs: false });
const value = defineModel<string>({ default: '' });
</script>
<template><Input v-bind="$attrs" v-model:value="value" /></template>
