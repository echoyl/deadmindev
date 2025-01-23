import { saFormTabColumnsType } from '../../../helpers';

const settingColumns: saFormTabColumnsType = [
  {
    title: '基础信息',
    formColumns: [
      {
        valueType: 'group',
        columns: [
          {
            dataIndex: 'disable_after_post',
            title: '禁用主模型后的操作',
            valueType: 'switch',
            tooltip: '禁用后关联的模型数据不再自动更新或插入操作',
            colProps: { span: 12 },
          },
        ],
      },
    ],
  },
];

export default settingColumns;
