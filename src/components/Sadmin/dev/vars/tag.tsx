import { saFormColumnsType } from '../../helpers';

const tagConfig: saFormColumnsType = [
  {
    dataIndex: 'color',
    valueType: 'colorPicker',
    title: '颜色选择',
    tooltip: '使用对象数据后，该设置失效',
  },
  {
    dataIndex: 'icon选择',
    valueType: 'iconSelect',
    title: 'icon',
    fieldProps: {
      width: 200,
      placeholder: '请选择图标',
    },
  },
  {
    dataIndex: 'bordered',
    valueType: 'switch',
    title: '是否有边框',
    fieldProps: {
      defaultChecked: true,
    },
  },
  {
    dataIndex: 'ellipsis',
    valueType: 'switch',
    title: '开启ellipsis',
    fieldProps: {
      defaultChecked: true,
    },
  },
];

export default tagConfig;
