import { t, type saFormColumnsType } from '../../helpers';

const colProps = {
  colProps: {
    span: 3,
  },
};
const tagConfig = (): saFormColumnsType => [
  {
    dataIndex: 'if',
    title: t('show'),
    valueType: 'modalJson',
    fieldProps: {
      type: 'textarea',
    },
    ...colProps,
  },
  {
    dataIndex: 'color',
    valueType: 'colorPicker',
    title: 'Color',
    tooltip: '使用对象数据后，该设置失效',
    fieldProps: {
      size: 'small',
    },
    ...colProps,
  },
  {
    dataIndex: 'icon',
    valueType: 'iconSelect',
    title: 'icon',
    fieldProps: {
      size: 'small',
    },
    ...colProps,
  },
  {
    dataIndex: 'bordered',
    valueType: 'switch',
    title: 'Border',
    fieldProps: {
      defaultChecked: true,
    },
    ...colProps,
  },
  {
    dataIndex: 'ellipsis',
    valueType: 'switch',
    title: 'Ellipsis',
    fieldProps: {
      defaultChecked: true,
    },
    ...colProps,
  },
];

export default tagConfig;
