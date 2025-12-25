import { Cascader, Select, type GetProps } from 'antd';
import type { FC, Key } from 'react';
import { useContext } from 'react';
import { SaDevContext } from '../../dev';
import { getModelColumns } from '../../dev/table/baseFormColumns';

type MenuSelectProps = GetProps<typeof Select>;
type MenuCascaderProps = GetProps<typeof Cascader>;

const ColumnSelect: FC<MenuSelectProps & { modelId?: Key }> = (props) => {
  const { modelId = 0, ...rest } = props;
  const { setting } = useContext(SaDevContext);
  const options = getModelColumns(modelId, setting?.adminSetting?.dev, true);
  return <Select options={options} allowClear placeholder={'请选择字段'} showSearch {...rest} />;
};

const render = (_: any, props: any) => {
  const { fieldProps } = props;
  return <ColumnSelect {...fieldProps} />;
};

export const devColumnSelect = {
  render,
  renderFormItem: render,
};

const ColumnRelationSelect: FC<MenuCascaderProps & { modelId?: Key }> = (props) => {
  const { modelId = 0, ...rest } = props;
  const { setting } = useContext(SaDevContext);
  const options = getModelColumns(modelId, setting?.adminSetting?.dev);
  return (
    <Cascader
      options={options}
      allowClear
      placeholder={'请选择字段'}
      showSearch
      changeOnSelect
      {...rest}
    />
  );
};

const renderFormItem = (_: any, props: any) => {
  const { fieldProps } = props;
  return <ColumnRelationSelect {...fieldProps} />;
};

export const devColumnRelationSelect = {
  render: renderFormItem,
  renderFormItem,
};

export default ColumnSelect;
