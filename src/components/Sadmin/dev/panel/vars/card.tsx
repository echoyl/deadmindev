import { saFormColumnsType } from '@/components/Sadmin/helpers';
import { layoutType } from './base';
import chartColumns from './chart';

const staticConfig: saFormColumnsType = [
  {
    valueType: 'group',
    title: 'statistic设置',
    columns: [
      {
        title: '标题',
        dataIndex: ['defaultConfig', 'statistic', 'title'],
        colProps: { span: 6 },
      },
      {
        title: '提示',
        dataIndex: ['defaultConfig', 'statistic', 'tip'],
        colProps: { span: 6 },
      },
      {
        title: '前缀',
        dataIndex: ['defaultConfig', 'statistic', 'prefix'],
        colProps: { span: 6 },
      },
      {
        title: '后缀',
        dataIndex: ['defaultConfig', 'statistic', 'suffix'],
        colProps: { span: 6 },
      },
    ],
  },

  {
    valueType: 'group',
    columns: [
      {
        title: '状态',
        dataIndex: ['defaultConfig', 'statistic', 'status'],
        valueType: 'select',
        fieldProps: {
          options: [
            { label: 'success', value: 'success' },
            { label: 'processing', value: 'processing' },
            { label: 'default', value: 'default' },
            { label: 'error', value: 'error' },
            { label: 'warning', value: 'warning' },
          ],
        },
        colProps: { span: 12 },
      },
      {
        title: '链接',
        dataIndex: ['defaultConfig', 'href'],
        colProps: { span: 12 },
      },
    ],
  },
  {
    valueType: 'group',
    columns: [
      {
        title: '描述',
        dataIndex: ['defaultConfig', 'statistic', 'description'],
        valueType: 'textarea',
        colProps: { span: 24 },
      },
    ],
  },
];
const footerConfig: saFormColumnsType = [
  {
    valueType: 'group',
    title: 'footer设置',
    columns: [
      {
        title: '类型',
        dataIndex: ['defaultConfig', 'footer', 'type'],
        valueType: 'select',
        tooltip: '如果类型是趋势，所选数据应该返回有trend:[{title,value,trend}]格式数据',
        fieldProps: {
          options: [
            { label: '文本', value: 'text' },
            { label: '趋势', value: 'trend' },
          ],
          defaultValue: 'text',
        },
        colProps: { span: 12 },
      },
      {
        name: [['defaultConfig', 'footer', 'type']],
        valueType: 'dependency',
        columns: ({ defaultConfig }) => {
          if (defaultConfig?.footer?.type == 'trend') {
            return layoutType(['defaultConfig', 'footer', 'layout']);
          } else {
            return [
              {
                title: '底部设置',
                dataIndex: ['defaultConfig', 'footer', 'text'],
                valueType: 'textarea',
                colProps: { span: 24 },
              },
            ];
          }
        },
      },
    ],
  },
];

const cardColumns = (data): saFormColumnsType => [
  {
    valueType: 'group',
    columns: [
      {
        title: 'statistic',
        dataIndex: ['defaultConfig', 'open', 'statistic'],
        valueType: 'switch',
        colProps: { span: 8 },
      },
      {
        title: 'chart',
        dataIndex: ['defaultConfig', 'open', 'chart'],
        valueType: 'switch',
        colProps: { span: 8 },
      },
      {
        title: 'footer',
        dataIndex: ['defaultConfig', 'open', 'footer'],
        valueType: 'switch',
        colProps: { span: 8 },
      },
    ],
  },
  {
    name: ['defaultConfig', 'sourceDataName'],
    valueType: 'dependency',
    columns: ({ defaultConfig, sourceDataName }) => {
      if (!defaultConfig) return [];
      let cls: saFormColumnsType = [];

      if (defaultConfig.open?.statistic) {
        cls = [...cls, ...staticConfig];
      }
      if (defaultConfig.open?.chart) {
        const _chartColumns = chartColumns(data);
        cls = [
          ...cls,
          {
            valueType: 'group',
            title: 'chart设置',
            columns: [..._chartColumns],
          },
        ];
      }
      if (defaultConfig.open?.footer) {
        cls = [...cls, ...footerConfig];
      }

      return cls;
    },
  },
];

export default cardColumns;
