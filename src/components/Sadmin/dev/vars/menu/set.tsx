import type { saFormColumnsType } from '@/components/Sadmin/helpers';

const table: saFormColumnsType = [
  {
    valueType: 'group',
    columns: [
      {
        dataIndex: ['showType'],
        title: '显示类型',
        valueType: 'radioButton',
        fieldProps: {
          buttonStyle: 'solid',
          defaultValue: 'table',
          options: [
            { label: 'table', value: 'table' },
            { label: 'card', value: 'card' },
          ],
        },
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
    ],
  },
  {
    valueType: 'group',
    columns: [
      {
        dataIndex: ['table', 'scroll', 'y'],
        title: '滚动高度',
        colProps: { span: 6 },
      },
      {
        dataIndex: 'scollYFullscreen',
        title: '滚动自动全屏',
        valueType: 'switch',
        colProps: { span: 6 },
        tooltip: '开启后页面自动计算table的滚动高度，如果屏幕过矮可能导致table无高度',
      },
      {
        dataIndex: ['table', 'scroll', 'x'],
        title: '滚动宽度',
        colProps: { span: 12 },
        tooltip: '输入 max-content 即可',
      },
    ],
  },
  {
    valueType: 'group',
    columns: [
      {
        dataIndex: ['table', 'styles', 'section', 'minHeight'],
        title: '最小高度',
        colProps: { span: 6 },
      },
      {
        dataIndex: 'minHeightFullscreen',
        title: '最小高度自动全屏',
        valueType: 'switch',
        colProps: { span: 6 },
        tooltip: '开启后页面自动计算table的最小高度,开启时不要自定义填写左侧的最小高度',
        fieldProps: {
          defaultValue: true,
        },
      },
      {
        dataIndex: ['table', 'checkHoverDisable'],
        title: '禁用勾选框悬浮效果',
        valueType: 'switch',
        colProps: { span: 12 },
      },
    ],
  },
  {
    valueType: 'group',
    columns: [
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
];

const card: saFormColumnsType = [
  {
    valueType: 'group',
    columns: [
      {
        dataIndex: ['card', 'grid', 'column'],
        title: '列数',
        valueType: 'digit',
        fieldProps: {
          defaultValue: 6,
        },
        width: '100%',
        colProps: { span: 12 },
      },
      {
        dataIndex: ['card', 'grid', 'gutter'],
        title: '间隔',
        valueType: 'digit',
        fieldProps: {
          defaultValue: 16,
        },
        width: '100%',
        colProps: { span: 12 },
      },
    ],
  },
  {
    valueType: 'group',
    columns: [
      {
        dataIndex: ['card', 'grid', 'coverImageHeight'],
        title: '封面图高度',
        valueType: 'digit',
        fieldProps: {
          defaultValue: 180,
        },
        width: '100%',
        colProps: { span: 12 },
      },
      {
        dataIndex: ['card', 'grid', 'descriptionRows'],
        title: '描述行数',
        valueType: 'digit',
        fieldProps: {
          defaultValue: 2,
        },
        width: '100%',
        colProps: { span: 12 },
      },
    ],
  },
];

const form: saFormColumnsType = [
  {
    valueType: 'group',
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
    ],
  },
  {
    valueType: 'group',
    columns: [
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
];
const other: saFormColumnsType = [
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
      {
        dataIndex: 'viewable',
        title: '操作栏查看项',
        valueType: 'switch',
        colProps: { span: 12 },
        fieldProps: {
          defaultValue: false,
        },
      },
    ],
  },
];

const leftmenu: saFormColumnsType = [
  {
    valueType: 'group',
    columns: [
      {
        dataIndex: ['leftMenu', 'close'],
        title: '是否关闭',
        valueType: 'switch',
        colProps: { span: 12 },
        fieldProps: {
          defaultValue: true,
        },
      },
      {
        dataIndex: ['leftMenu', 'title'],
        title: '显示标题',
        colProps: { span: 12 },
      },
    ],
  },
  {
    valueType: 'group',
    columns: [
      {
        dataIndex: ['leftMenu', 'name'],
        title: '数据源name',
        colProps: { span: 12 },
      },
      {
        dataIndex: ['leftMenu', 'url_name'],
        title: 'URL name',
        colProps: { span: 12 },
      },
    ],
  },
  {
    valueType: 'group',
    columns: [
      {
        dataIndex: ['leftMenu', 'field', 'title'],
        title: '字段title',
        colProps: { span: 12 },
      },
      {
        dataIndex: ['leftMenu', 'field', 'key'],
        title: '字段key',
        colProps: { span: 12 },
      },
    ],
  },
  {
    valueType: 'group',
    columns: [
      {
        dataIndex: ['leftMenu', 'field', 'children'],
        title: '字段children',
        colProps: { span: 12 },
      },
      {
        dataIndex: ['leftMenu', 'page'],
        title: '关联页面',
        tooltip: '选择关联页面后会开启编辑删除修改的功能',
        valueType: 'menuSelect',
        colProps: {
          span: 12,
        },
      },
    ],
  },
  {
    valueType: 'group',
    columns: [
      {
        dataIndex: ['leftMenu', 'defaultExpandAll'],
        title: '是否全部展开',
        valueType: 'switch',
        colProps: { span: 12 },
        fieldProps: {
          defaultValue: true,
        },
      },
      {
        dataIndex: ['leftMenu', 'showLine'],
        title: '是否显示连接线',
        valueType: 'switch',
        colProps: { span: 12 },
        fieldProps: {
          defaultValue: true,
        },
      },
    ],
  },
];

export default [
  { title: '列表设置', formColumns: table },
  { title: '卡片列表设置', formColumns: card },
  { title: '表单设置', formColumns: form },
  { title: '左侧菜单', formColumns: leftmenu },
  { title: '其它设置', formColumns: other },
];
