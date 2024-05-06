import { saFormColumnsType } from '@/components/Sadmin/helpers';

const barColumns = (data): saFormColumnsType => [
  {
    valueType: 'group',
    columns: [
      {
        title: 'x轴字段',
        dataIndex: ['defaultConfig', 'chart', 'xField'],
        colProps: { span: 12 },
        valueType: 'select',
        fieldProps: {
          options: data?.fields,
        },
      },
      {
        title: 'y轴字段',
        dataIndex: ['defaultConfig', 'chart', 'yField'],
        colProps: { span: 12 },
        valueType: 'select',
        fieldProps: {
          options: data?.fields,
        },
      },
    ],
  },
];

export default barColumns;
