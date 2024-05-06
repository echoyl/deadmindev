import { saFormColumnsType } from '../../helpers';

export const dependencyOn = (columns: any[]): saFormColumnsType => {
  const show: saFormColumnsType = [
    {
      dataIndex: 'condition_type',
      valueType: 'select',
      title: '满足条件',
      fieldProps: {
        defaultValue: 'all',
        options: [
          { label: '全部满足', value: 'all' },
          { label: '任一满足', value: 'one' },
        ],
      },
    },
    {
      dataIndex: 'condition',
      valueType: 'formList',
      columns: [
        {
          valueType: 'group',
          columns: [
            {
              title: '字段选择',
              valueType: 'cascader',
              dataIndex: 'name',
              width: 240,
              fieldProps: {
                options: columns,
                showSearch: true,
                changeOnSelect: true,
              },
            },
            {
              title: '自定义字段',
              dataIndex: 'cname',
              width: 120,
              tooltip: '无字段选择是可手动填入此项 . 分割为数组形式',
            },
            {
              title: '值',
              dataIndex: 'value',
              width: 100,
              tooltip: '值支持,拼接数据，会按inArray检测，无拼接的按 = 检测',
            },
            {
              title: '表达式',
              width: 120,
              dataIndex: 'exp',
              tooltip:
                '优先级高于值的设置，示例 {{record.id == 1 && user.id == 2}} record:当前记录信息 user当前登录用户信息',
            },
          ],
        },
      ],
    },
  ];
  const render: saFormColumnsType = [
    {
      dataIndex: 'condition',
      valueType: 'formList',
      columns: [
        {
          valueType: 'group',
          columns: [
            {
              title: '字段选择',
              valueType: 'cascader',
              dataIndex: 'name',
              fieldProps: {
                options: columns,
                showSearch: true,
                changeOnSelect: true,
              },
              width: 'md',
            },
            {
              title: '自定义字段',
              dataIndex: 'cname',
              width: 120,
              tooltip: '无字段选择是可手动填入此项 . 分割为数组形式',
            },
          ],
        },
      ],
    },
  ];

  return [
    {
      title: '类型',
      dataIndex: 'type',
      valueType: 'select',
      tooltip: '控制切换是否显示，或依赖项显示可以添加计算等',
      fieldProps: {
        defaultValue: 'show',
        options: [
          { label: '切换显示', value: 'show' },
          { label: '渲染显示', value: 'render' },
        ],
      },
    },
    {
      valueType: 'dependency',
      name: ['type'],
      columns: ({ type }) => {
        return !type || type == 'show' ? show : render;
      },
    },
  ];
};
