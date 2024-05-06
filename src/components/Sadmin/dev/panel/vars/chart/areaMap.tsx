import { saFormColumnsType } from '@/components/Sadmin/helpers';

const areaMapColumns = (data): saFormColumnsType => [
  {
    valueType: 'group',
    columns: [
      {
        title: '字段',
        dataIndex: ['defaultConfig', 'chart', 'field'],
        colProps: { span: 12 },
        valueType: 'select',
        fieldProps: {
          options: data?.fields,
        },
      },
      {
        title: '区间值min',
        dataIndex: ['defaultConfig', 'chart', 'domain_min'],
        colProps: { span: 6 },
        valueType: 'digit',
        width: '100%',
      },
      {
        title: '区间值max',
        dataIndex: ['defaultConfig', 'chart', 'domain_max'],
        colProps: { span: 6 },
        valueType: 'digit',
        width: '100%',
      },
    ],
  },
];

export default areaMapColumns;
