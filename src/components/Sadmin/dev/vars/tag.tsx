import { saFormColumnsType } from '../../helpers';

const tagConfig: saFormColumnsType = [
  {
    dataIndex: 'if',
    title: '显示条件',
    valueType: 'modalJson',
    fieldProps: {
      title: '编辑条件',
      type: 'textarea',
      btn: { size: 'small' },
    },
  },
  {
    dataIndex: 'color',
    valueType: 'colorPicker',
    title: '颜色选择',
    tooltip: '使用对象数据后，该设置失效',
  },
  {
    dataIndex: 'icon',
    valueType: 'iconSelect',
    title: 'icon',
    fieldProps: {
      width: 180,
      placeholder: '请选择图标',
    },
  },
  {
    dataIndex: 'bordered',
    valueType: 'switch',
    title: '是否有边框',
    fieldProps: {
      defaultChecked: true,
      checkedChildren: '边框',
      unCheckedChildren: '边框',
    },
  },
  {
    dataIndex: 'ellipsis',
    valueType: 'switch',
    title: '开启ellipsis',
    fieldProps: {
      defaultChecked: true,
      checkedChildren: 'ellipsis',
      unCheckedChildren: 'ellipsis',
    },
  },
];

export default tagConfig;
