<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { UiButton, UiInput, UiPassword, UiDataTable, UiModal, UiSelect, UiSwitch } from '../ui';
import { resourceFor, type Field, type Option } from '../modules/system/schema';
import { repository, demoMode, type Row } from '../modules/system/repository';
import { handleError } from '../services/error';
const route = useRoute();
const router = useRouter();
const resource = computed(() => resourceFor(String(route.meta.resource)));
const rows = ref<Row[]>([]);
const total = ref(0);
const page = ref(1);
const size = 10;
const loading = ref(false);
const search = ref('');
const open = ref(false);
const deleting = ref<Row>();
const isNew = ref(false);
const readonly = ref(false);
const saving = ref(false);
const validation = ref('');
const model = reactive<Row>({});
const lookups = reactive<Record<string, Option[]>>({});
const columns = computed(() => [
  { key: resource.value.id, title: 'ID' },
  ...resource.value.fields
    .filter((f) => f.type !== 'password' && f.type !== 'select')
    .map((f) => ({ key: f.key, title: f.label })),
]);
function display(row: Row, key: string) {
  const value = row[key];
  return typeof value === 'boolean' ? (value ? '是' : '否') : String(value ?? '—');
}
let revision = 0;
async function load() {
  const ticket = ++revision;
  loading.value = true;
  try {
    const primary = resource.value.fields[0]!.key;
    const result = await repository.list(resource.value, page.value, size, {
      [primary]: search.value,
      ...(route.query.typeCode ? { typeCode: String(route.query.typeCode) } : {}),
    });
    if (ticket === revision) {
      rows.value = result.records;
      total.value = result.total;
    }
  } finally {
    if (ticket === revision) loading.value = false;
  }
}
watch(
  () => [route.meta.resource, route.query.typeCode],
  () => {
    page.value = 1;
    search.value = '';
    rows.value = [];
    open.value = false;
    deleting.value = undefined;
    void load().catch(handleError);
  },
  { immediate: true },
);
async function edit(row?: Row, view = false) {
  if (row) row = await repository.detail(resource.value, row);
  isNew.value = !row;
  readonly.value = view;
  validation.value = '';
  for (const key of Object.keys(model)) delete model[key];
  for (const field of resource.value.fields)
    model[field.key] = field.multiple
      ? []
      : field.type === 'boolean'
        ? false
        : field.type === 'number'
          ? 0
          : '';
  Object.assign(model, row || {});
  delete model.password;
  if (route.query.typeCode) model.typeCode = String(route.query.typeCode);
  for (const field of resource.value.fields) {
    if (!field.lookup) continue;
    const target = resourceFor(field.lookup);
    const records = await repository.options(target);
    const label = target.fields.find((f) => f.key.endsWith('Name'))?.key || target.fields[0]!.key;
    lookups[field.key] = records
      .filter(
        (item) =>
          !row || item[target.id] !== row[resource.value.id] || target.key !== resource.value.key,
      )
      .map((item) => ({ label: String(item[label]), value: item[target.id] as number | string }));
    if (field.key === 'parentId') lookups[field.key].unshift({ label: '顶级', value: 0 });
    if (row && field.multiple && !Array.isArray(row[field.key])) {
      const list = row[field.lookup + 'List'];
      model[field.key] = Array.isArray(list) ? list.map((item: Row) => item[target.id]) : [];
    }
  }
  open.value = true;
}
function selectValue(key: string) {
  return model[key] as string | number | (string | number)[];
}
function update(field: Field, value: unknown) {
  model[field.key] = field.type === 'number' ? Number(value) : value;
}
async function save() {
  if (saving.value) return;
  for (const field of resource.value.fields) {
    const value = model[field.key];
    if (
      field.required &&
      (value === undefined || value === '' || (Array.isArray(value) && !value.length))
    ) {
      validation.value = '请填写' + field.label;
      return;
    }
    if (field.type === 'number' && !Number.isFinite(value)) {
      validation.value = field.label + '必须是数字';
      return;
    }
    if (field.minLength && value && String(value).length < field.minLength) {
      validation.value = field.label + '至少' + field.minLength + '位';
      return;
    }
  }
  if (resource.value.key === 'user' && isNew.value && !model.password) {
    validation.value = '请输入密码';
    return;
  }
  if (model.metaData) {
    try {
      JSON.parse(String(model.metaData));
    } catch {
      validation.value = '元数据必须为有效 JSON';
      return;
    }
  }
  saving.value = true;
  try {
    const values = { ...model };
    if (!values.password) delete values.password;
    await repository.save(resource.value, values, isNew.value);
    open.value = false;
    await load();
  } finally {
    saving.value = false;
  }
}
async function remove() {
  if (!deleting.value || saving.value) return;
  saving.value = true;
  try {
    await repository.remove(resource.value, deleting.value);
    deleting.value = undefined;
    if (rows.value.length === 1 && page.value > 1) page.value--;
    await load();
  } finally {
    saving.value = false;
  }
}
async function toggle(row: Row) {
  await repository.toggle(resource.value, row);
  await load();
}
function dictionaryItems(row: Row) {
  return router.push({
    path: '/system/dictionary-item',
    query: { typeCode: String(row.typeCode) },
  });
}
</script>
<template>
  <main class="page-card">
    <h1 class="mb-2 text-2xl font-bold">{{ resource.title }}</h1>
    <p class="mb-4 text-sm text-slate-500">
      {{ demoMode ? '本地演示数据；设置 VITE_DEMO_MODE=false 接入原模板接口。' : '后端接口模式' }}
    </p>
    <div class="mb-4 flex flex-wrap items-center gap-3">
      <UiInput
        v-model="search"
        :placeholder="'搜索' + resource.fields[0]?.label"
        @keyup.enter="
          page = 1;
          load();
        "
      /><UiButton
        :disabled="loading"
        @click="
          page = 1;
          load();
        "
        >查询</UiButton
      ><UiButton @click="edit()">新增</UiButton>
    </div>
    <p v-if="loading" role="status">加载中…</p>
    <UiDataTable :rows="rows" :columns="columns" :row-key="resource.id" :display="display">
      <template #actions="{ row }"
        ><div class="flex flex-wrap gap-2">
          <UiButton @click="edit(row)">编辑</UiButton
          ><UiButton @click="edit(row, true)">详情</UiButton
          ><UiButton
            v-if="resource.fields.some((f) => f.key === 'disabled')"
            @click="toggle(row)"
            >{{ row.disabled ? '启用' : '禁用' }}</UiButton
          ><UiButton v-if="resource.key === 'dictionary'" @click="dictionaryItems(row)"
            >字典项</UiButton
          ><UiButton @click="deleting = row">删除</UiButton>
        </div></template
      >
    </UiDataTable>
    <div class="mt-4 flex items-center gap-3">
      <UiButton
        :disabled="page <= 1 || loading"
        @click="
          page--;
          load();
        "
        >上一页</UiButton
      ><span>第 {{ page }} 页 · 共 {{ total }} 条</span
      ><UiButton
        :disabled="page * size >= total || loading"
        @click="
          page++;
          load();
        "
        >下一页</UiButton
      >
    </div>
    <UiModal
      v-model:open="open"
      :title="(readonly ? '详情' : isNew ? '新增' : '编辑') + resource.title"
    >
      <form class="flex flex-col gap-4" @submit.prevent="save">
        <label
          v-for="field in resource.fields.filter((f) => !readonly || f.type !== 'password')"
          :key="field.key"
          class="flex flex-col gap-2"
          ><span>{{ field.label }}{{ field.required ? ' *' : '' }}</span>
          <UiSwitch
            v-if="field.type === 'boolean'"
            :model-value="Boolean(model[field.key])"
            :disabled="readonly || saving"
            @update:model-value="update(field, $event)"
          />
          <UiSelect
            v-else-if="field.type === 'select'"
            :model-value="selectValue(field.key)"
            :options="field.options || lookups[field.key] || []"
            :multiple="field.multiple"
            :disabled="readonly || saving"
            @update:model-value="update(field, $event)"
          />
          <UiPassword
            v-else-if="field.type === 'password'"
            :model-value="String(model[field.key] || '')"
            :disabled="readonly || saving"
            autocomplete="new-password"
            @update:model-value="update(field, $event)"
          />
          <UiInput
            v-else
            :model-value="String(model[field.key] ?? '')"
            :disabled="readonly || saving"
            @update:model-value="update(field, $event)"
          />
        </label>
        <p v-if="validation" role="alert" class="text-red-600">{{ validation }}</p>
        <div class="flex gap-3">
          <UiButton v-if="!readonly" :disabled="saving" @click="save">{{
            saving ? '保存中…' : '保存'
          }}</UiButton
          ><UiButton :disabled="saving" @click="open = false">关闭</UiButton>
        </div>
      </form>
    </UiModal>
    <UiModal :open="Boolean(deleting)" title="确认删除" @update:open="deleting = undefined"
      ><p class="mb-4">确定删除当前记录？</p>
      <div class="flex gap-3">
        <UiButton :disabled="saving" @click="remove">确认删除</UiButton
        ><UiButton :disabled="saving" @click="deleting = undefined">取消</UiButton>
      </div></UiModal
    >
  </main>
</template>
