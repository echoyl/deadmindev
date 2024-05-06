import { saFormColumnsType } from '@/components/Sadmin/helpers';
import { chartShapeField } from '../base';

const areaColumns = (data): saFormColumnsType => [
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
      chartShapeField(6),
    ],
  },
];

export default areaColumns;
