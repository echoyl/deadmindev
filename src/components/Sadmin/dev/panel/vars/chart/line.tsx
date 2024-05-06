import { saFormColumnsType } from '@/components/Sadmin/helpers';
import { chartShapeField } from '../base';

const lineColumns = (data): saFormColumnsType => [
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
        tooltip: '多条线可使用该参数',
        dataIndex: ['defaultConfig', 'chart', 'colorField'],
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

export default lineColumns;
