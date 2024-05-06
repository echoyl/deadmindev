import { saFormColumnsType } from '../../helpers';

const leixing = [
  { label: 'string', value: 'string' },
  { label: 'number', value: 'number' },
  { label: 'boolean', value: 'boolean' },
  { label: 'url', value: 'url' },
  { label: 'email', value: 'email' },
];

const rules: saFormColumnsType = [
  {
    dataIndex: 'data',
    valueType: 'formList',
    rowProps: { gutter: 0 },
    columns: [
      {
        valueType: 'group',
        columns: [
          {
            title: '类型',
            valueType: 'select',
            dataIndex: 'type',
            colProps: { span: 4 },

            fieldProps: {
              options: leixing,
              showSearch: true,
              changeOnSelect: true,
              defaultValue: 'string',
            },
          },
          {
            title: '最小',
            colProps: { span: 4 },
            dataIndex: 'min',
            valueType: 'digit',
            tooltip:
              '必须设置 type：string 类型为字符串最小长度；number 类型时为最小值；array 类型时为数组最小长度',
          },

          {
            title: '最大',
            colProps: { span: 4 },
            dataIndex: 'max',
            valueType: 'digit',
            tooltip:
              '必须设置 type：string 类型为字符串最大长度；number 类型时为最大值；array 类型时为数组最大长度',
          },
          {
            title: '正则',
            colProps: { span: 4 },
            dataIndex: 'pattern',
          },

          {
            title: '提示语',
            colProps: { span: 6 },
            dataIndex: 'message',
          },
          {
            title: '必填',
            valueType: 'switch',
            colProps: { span: 2 },
            dataIndex: 'required',
          },
        ],
      },
    ],
  },
];

export default rules;
