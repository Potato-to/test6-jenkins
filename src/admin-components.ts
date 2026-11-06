/* eslint-disable vue/one-component-per-file -- Small adapters share a single UI contract. */
import { defineComponent, h, type PropType } from 'vue';
import { Table, Modal, Select, Switch, Drawer } from 'ant-design-vue';
export type Row = Record<string, unknown>;
export interface Column {
  key: string;
  title: string;
}
export interface Option {
  value: string | number;
  label: string;
}
export const UiDataTable = defineComponent({
  props: {
    rows: { type: Array as PropType<Row[]>, required: true },
    columns: { type: Array as PropType<Column[]>, required: true },
    rowKey: { type: String, required: true },
    display: { type: Function as PropType<(row: Row, key: string) => string>, required: true },
  },
  setup(props, { slots }) {
    return () =>
      h(Table, {
        dataSource: props.rows,
        rowKey: props.rowKey,
        pagination: false,
        scroll: { x: 'max-content' },
        columns: [
          ...props.columns.map((c) => ({
            title: c.title,
            key: c.key,
            dataIndex: c.key,
            customRender: ({ record }: { record: Row }) => props.display(record, c.key),
          })),
          {
            title: '操作',
            key: 'actions',
            customRender: ({ record }: { record: Row }) => slots.actions?.({ row: record }),
          },
        ],
      });
  },
});
export const UiModal = defineComponent({
  props: { open: Boolean, title: { type: String, default: '' } },
  emits: ['update:open'],
  setup(props, { slots, emit }) {
    return () =>
      h(
        Modal,
        {
          open: props.open,
          title: props.title,
          footer: null,
          'onUpdate:open': (v: boolean) => emit('update:open', v),
        },
        () => slots.default?.(),
      );
  },
});
export const UiSelect = defineComponent({
  props: {
    modelValue: {
      type: [String, Number, Array] as PropType<string | number | (string | number)[]>,
      default: undefined,
    },
    options: { type: Array as PropType<Option[]>, default: () => [] },
    multiple: Boolean,
    disabled: Boolean,
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () =>
      h(Select, {
        value: props.modelValue,
        options: props.options,
        mode: props.multiple ? 'multiple' : undefined,
        disabled: props.disabled,
        style: 'width:100%',
        'onUpdate:value': (v: unknown) => emit('update:modelValue', v),
      });
  },
});
export const UiSwitch = defineComponent({
  props: { modelValue: Boolean, disabled: Boolean },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () =>
      h(Switch, {
        checked: props.modelValue,
        disabled: props.disabled,
        'onUpdate:checked': (v: string | number | boolean) => emit('update:modelValue', Boolean(v)),
      });
  },
});

export const UiDrawer = defineComponent({
  props: { open: Boolean, title: { type: String, default: '' } },
  emits: ['update:open'],
  setup(props, { slots, emit }) {
    return () =>
      h(
        Drawer,
        {
          open: props.open,
          title: props.title,
          width: 600,
          'onUpdate:open': (v: boolean) => emit('update:open', v),
        },
        () => slots.default?.(),
      );
  },
});
