import { isArr } from '@/components/Sadmin/checkers';
import {
  saFormColumnsType,
  saFormTabColumnsType,
  saValueTypeMapType,
} from '@/components/Sadmin/helpers';
import cardColumns from './card';
import chartColumns from './chart';
import formColumns from './form';
import tableColumns from './table';

const configColumn: saValueTypeMapType = {
  title: '配置',
  valueType: 'jsonEditor',
  dataIndex: 'config',
};

export const layoutType = (dataIndex): saFormColumnsType => [
  {
    title: '排列方式',
    dataIndex,
    valueType: 'select',
    fieldProps: {
      options: [
        { label: '横向', value: 'horizontal' },
        { label: '纵向', value: 'vertical' },
      ],
      defaultValue: 'horizontal',
    },
    colProps: { span: 12 },
  },
];

export const chartShapeField = (span: number): saValueTypeMapType => {
  return {
    title: '形状',
    dataIndex: ['defaultConfig', 'chart', 'shapeField'],
    valueType: 'select',
    fieldProps: {
      options: [
        { label: 'smooth - 平滑', value: 'smooth' },
        { label: 'trail - 变粗', value: 'trail' },
      ],
    },
    colProps: { span },
  };
};

export const baseRowColumns = (data: any[]): saFormTabColumnsType => {
  return [
    {
      title: '基础信息',
      formColumns: [
        {
          title: 'Title',
          dataIndex: 'title',
          colProps: { span: 12 },
          // fieldProps: {
          //   options: [
          //     { label: '默认分组', value: 'normal' },
          //     { label: 'tab', value: 'tab' },
          //   ],
          //   defaultValue: 'normal',
          // },
        },
      ],
    },
  ];
};

const baseFormColumns = (data: any[]): saFormTabColumnsType => {
  return [
    {
      title: '基础信息',
      formColumns: [
        {
          valueType: 'group',
          columns: [
            {
              title: '类型',
              dataIndex: 'type',
              valueType: 'select',
              fieldProps: {
                options: [
                  {
                    label: 'StatisticCard - 指标卡',
                    value: 'StatisticCard',
                  },
                  { label: 'tab', value: 'tab' },
                  { label: '表格', value: 'table' },
                  { label: '容器', value: 'rows' },
                  { label: '查询表单', value: 'form' },
                  { label: '个人信息', value: 'user' },
                ],
              },
              colProps: { span: 24 },
            },
          ],
        },
        {
          valueType: 'group',
          columns: [
            { title: 'Title', dataIndex: 'title', colProps: { span: 12 } },
            {
              title: '数据源',
              dataIndex: 'sourceDataName',
              valueType: 'select',
              fieldProps: {
                options: isArr(data) ? data : [],
                showSearch: true,
              },
              colProps: { span: 12 },
            },
          ],
        },

        {
          name: ['type', 'sourceDataName'],
          valueType: 'dependency',
          columns: ({ type, sourceDataName }) => {
            const sourceData = data?.find((v) => v.value == sourceDataName);
            if (type == 'chart') {
              return chartColumns(sourceData);
            } else if (type == 'table') {
              return tableColumns(sourceData);
            } else if (type == 'StatisticCard') {
              return cardColumns(sourceData);
            } else if (type == 'form') {
              return formColumns(sourceData);
            } else if (type == 'tab') {
              return formColumns(sourceData);
            }
            return [];
          },
        },
      ],
    },
    {
      title: '配置',
      formColumns: [
        {
          valueType: 'group',
          columns: [
            {
              title: '列宽',
              dataIndex: 'customer_span',
              valueType: 'digit',
              width: '100%',
              colProps: { span: 12 },
            },
            {
              title: '自定义高度',
              dataIndex: 'height',
              valueType: 'digit',
              width: '100%',
              colProps: { span: 12 },
            },
          ],
        },
        {
          valueType: 'group',
          columns: [
            {
              title: '显示条件',
              dataIndex: 'show_condition',
              tooltip:
                '可根据当前用户编写是否显示该组件,例如 {{ user.id == 1?true:false }} user为当前登录用户信息',
              valueType: 'textarea',
              colProps: { span: 24 },
            },
          ],
        },
        configColumn,
      ],
    },
  ];
};
export default baseFormColumns;
