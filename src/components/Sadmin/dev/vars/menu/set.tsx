import { saFormColumnsType } from '@/components/Sadmin/helpers';

const tableSet: saFormColumnsType = [
  {
    valueType: 'group',
    title: '表格设置',
    columns: [
      {
        dataIndex: ['table', 'scroll', 'y'],
        title: '滚动高度',
        valueType: 'digit',
        width: '100%',
        colProps: { span: 12 },
      },
      {
        dataIndex: ['table', 'scroll', 'x'],
        title: '滚动宽度',
        valueType: 'digit',
        width: '100%',
        colProps: { span: 12 },
      },
      {
        dataIndex: ['table', 'size'],
        title: '尺寸',
        valueType: 'radioButton',
        fieldProps: {
          buttonStyle: 'solid',
          defaultValue: 'middle',
          options: [
            { label: 'large', value: 'large' },
            { label: 'middle', value: 'middle' },
            { label: 'small', value: 'small' },
          ],
        },
        colProps: { span: 12 },
      },
      {
        dataIndex: ['table', 'checkHoverDisable'],
        title: '禁用勾选框悬浮效果',
        valueType: 'switch',
        colProps: { span: 12 },
      },
      {
        dataIndex: ['table', 'bordered'],
        title: 'Bordered',
        valueType: 'switch',
        colProps: { span: 12 },
      },
      {
        dataIndex: 'checkDisable',
        title: '禁用勾选',
        valueType: 'switch',
        colProps: { span: 12 },
      },
    ],
  },
  {
    valueType: 'group',
    title: '分页设置',
    columns: [
      {
        dataIndex: ['pagination', 'pageSize'],
        title: '分页数量',
        valueType: 'digit',
        fieldProps: {
          defaultValue: 20,
        },
        width: '100%',
        colProps: { span: 12 },
      },
      {
        dataIndex: ['pagination', 'showQuickJumper'],
        title: '快速跳转',
        valueType: 'switch',
        fieldProps: {
          defaultValue: true,
        },
        colProps: { span: 12 },
      },
    ],
  },
  {
    valueType: 'group',
    title: '表单设置',
    columns: [
      {
        dataIndex: 'formWidth',
        title: '宽度',
        valueType: 'digit',
        width: '100%',
        colProps: { span: 12 },
      },
      {
        dataIndex: 'steps_form',
        title: '分步表单',
        valueType: 'switch',
        colProps: { span: 12 },
      },
      {
        dataIndex: ['form', 'layout'],
        title: '标签布局',
        valueType: 'radioButton',
        fieldProps: {
          buttonStyle: 'solid',
          defaultValue: 'vertical',
          options: [
            { label: 'horizontal', value: 'horizontal' },
            { label: 'vertical', value: 'vertical' },
            { label: 'inline', value: 'inline' },
          ],
        },
        colProps: { span: 12 },
      },
      {
        dataIndex: ['form', 'variant'],
        title: 'variant',
        valueType: 'radioButton',
        fieldProps: {
          buttonStyle: 'solid',
          defaultValue: 'filled',
          options: [
            { label: 'outlined', value: 'outlined' },
            { label: 'borderless', value: 'borderless' },
            { label: 'filled', value: 'filled' },
          ],
        },
        colProps: { span: 12 },
      },
    ],
  },
  {
    valueType: 'group',
    title: '分类设置',
    columns: [
      {
        dataIndex: 'level',
        title: '层级',
        colProps: { span: 12 },
      },
      {
        dataIndex: 'fold',
        title: '是否收缩',
        valueType: 'switch',
        colProps: { span: 12 },
      },
    ],
  },
  {
    valueType: 'group',
    title: '其它设置',
    columns: [
      {
        dataIndex: 'show_selectbar',
        title: '选择操作栏',
        valueType: 'switch',
        colProps: { span: 12 },
        fieldProps: {
          defaultValue: true,
        },
      },
    ],
  },
];

export default tableSet;
