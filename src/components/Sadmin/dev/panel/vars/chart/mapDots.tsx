import { saFormColumnsType } from '@/components/Sadmin/helpers';

const mapDotsColumns = (data): saFormColumnsType => [
  {
    valueType: 'group',
    columns: [
      {
        title: '缩放级别',
        dataIndex: ['defaultConfig', 'chart', 'zoom'],
        colProps: { span: 12 },
        valueType: 'digit',
        width: '100%',
      },
      {
        title: '中心点lat',
        dataIndex: ['defaultConfig', 'chart', 'lat'],
        colProps: { span: 6 },
        valueType: 'digit',
        width: '100%',
      },
      {
        title: '中心点lng',
        dataIndex: ['defaultConfig', 'chart', 'lng'],
        colProps: { span: 6 },
        valueType: 'digit',
        width: '100%',
      },
    ],
  },
];

export default mapDotsColumns;
