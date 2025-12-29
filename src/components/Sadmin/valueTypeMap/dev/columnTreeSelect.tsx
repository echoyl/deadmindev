import { devDefaultFields } from '@/pages/dev/model';
import { TreeSelect, type GetProps } from 'antd';
import { uniqBy } from 'es-toolkit';
import type { FC, Key } from 'react';
import { useContext } from 'react';
import { SaDevContext } from '../../dev';

type MenuSelectProps = GetProps<typeof TreeSelect>;
type TreeData = GetProps<typeof TreeSelect>['treeData'];
//生成关联模型的字段及其管理模型
const getModelColumnsTree = (
  id: Key,
  allModels: Record<string, any>[],
  pid: string = '',
  level: number = 1,
) => {
  const select_data = allModels?.find((v) => v.id == id);
  //console.log(foreign_model_id, allModels, select_data);
  const fields: TreeData = select_data
    ? uniqBy(
        [...select_data?.columns, ...devDefaultFields].map((v) => ({
          title: v.label ? v.label : [v.title, v.name].join(' - '),
          value: pid ? [pid, v.name ? v.name : v.value].join('-') : v.name ? v.name : v.value,
        })),
        (item) => item.value,
      )
    : [];

  if (level > 3) {
    //4层迭代后 直接终止 防止出现无限循环
    return fields;
  }
  //关联模型
  const guanlian: TreeData = select_data?.relations?.map((v: any) => ({
    title: [v.title, v.name].join(' - '),
    value: pid ? [pid, v.name, ''].join('-') : [v.name, ''].join('-'),
    children: getModelColumnsTree(
      v.foreign_model_id,
      allModels,
      pid ? [pid, v.id].join('-') : v.id,
      level + 1,
    ),
  }));
  return [...fields, ...(guanlian || [])];
};

const ColumnTreeSelect: FC<MenuSelectProps & { modelId?: Key }> = (props) => {
  const { modelId = 0, ...rest } = props;
  const { devData } = useContext(SaDevContext);
  const treeData = getModelColumnsTree(modelId, devData?.allModels);
  return (
    <TreeSelect
      treeData={treeData}
      treeLine={{ showLeafIcon: false }}
      allowClear={true}
      placeholder={'请选择字段'}
      treeCheckable={true}
      showCheckedStrategy={TreeSelect.SHOW_PARENT}
      multiple={true}
      {...rest}
    />
  );
};

const render = (_: any, props: any) => {
  const { fieldProps } = props;
  return <ColumnTreeSelect {...fieldProps} />;
};

export const devColumnTreeSelect = {
  render,
  formItemRender: render,
};
export default ColumnTreeSelect;
