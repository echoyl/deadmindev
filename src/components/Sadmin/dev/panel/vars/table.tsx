import { saFormColumnsType } from '@/components/Sadmin/helpers';

const tableColumns = (data): saFormColumnsType => [
  {
    valueType: 'group',
    columns: [
      {
        title: 'Table Size',
        dataIndex: ['defaultConfig', 'size'],
        colProps: { span: 12 },
        valueType: 'select',
        fieldProps: {
          options: ['small', 'middle', 'large'],
        },
      },
      {
        title: '分页',
        tooltip: '设置为0的话表示关闭分页',
        dataIndex: ['defaultConfig', 'cpage'],
        colProps: { span: 12 },
        valueType: 'digit',
        width: '100%',
      },
      {
        title: '列表字段',
        dataIndex: ['defaultConfig', 'columns'],
        colProps: { span: 24 },
        rowProps: { gutter: 0 },
        valueType: 'formList',
        columns: [
          {
            valueType: 'group',
            columns: [
              {
                title: 'dataIndex',
                dataIndex: 'dataIndex',
                colProps: { span: 6 },
                valueType: 'select',
                fieldProps: {
                  options: data?.fields,
                },
              },
              {
                title: 'title',
                dataIndex: 'title',
                colProps: { span: 6 },
              },
              {
                title: 'width',
                dataIndex: 'width',
                colProps: { span: 6 },
                valueType: 'digit',
              },
              {
                title: '排序',
                dataIndex: 'sort',
                valueType: 'switch',
                colProps: { span: 6 },
              },
            ],
          },
        ],
      },
    ],
  },
];

export default tableColumns;
