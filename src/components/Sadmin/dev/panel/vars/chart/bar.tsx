import { saFormColumnsType } from '@/components/Sadmin/helpers';

const barColumns = (data): saFormColumnsType => [
  {
    valueType: 'group',
    columns: [
      {
        title: 'x轴字段',
        dataIndex: ['defaultConfig', 'chart', 'xField'],
        colProps: { span: 6 },
        valueType: 'select',
        fieldProps: {
          options: data?.fields,
        },
      },
      {
        title: 'y轴字段',
        dataIndex: ['defaultConfig', 'chart', 'yField'],
        colProps: { span: 6 },
        valueType: 'select',
        fieldProps: {
          options: data?.fields,
        },
      },
      {
        title: '分组字段',
        dataIndex: ['defaultConfig', 'chart', 'colorField'],
        colProps: { span: 6 },
        valueType: 'select',
        fieldProps: {
          options: data?.fields,
        },
      },
      {
        title: '开启分组',
        dataIndex: ['defaultConfig', 'chart', 'group'],
        colProps: { span: 6 },
        valueType: 'switch',
      },
    ],
  },
];

export default barColumns;
