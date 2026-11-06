<script setup lang="ts">
import { InputPassword } from 'ant-design-vue';
defineOptions({ inheritAttrs: false });
const value = defineModel<string>({ default: '' });
</script>
<template><InputPassword v-bind="$attrs" v-model:value="value" /></template>
