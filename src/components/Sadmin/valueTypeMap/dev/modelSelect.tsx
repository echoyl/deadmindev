import type { GetProps } from 'antd';
import { TreeSelect } from 'antd';
import type { FC } from 'react';
import { useContext } from 'react';
import { SaDevContext } from '../../dev';

type MenuSelectProps = GetProps<typeof TreeSelect>;

const ModelSelect: FC<MenuSelectProps & { type?: 'model' | 'folder' }> = (props) => {
  const { type = 'model' } = props; //model-选择模型 folder-选择文件夹
  const { devData } = useContext(SaDevContext);
  return (
    <TreeSelect
      treeData={type == 'model' ? devData?.allModelsTree : devData?.folderModelsTree}
      treeLine={{ showLeafIcon: true }}
      treeDefaultExpandAll={true}
      allowClear={true}
      placeholder={'请选择模型'}
      {...props}
    />
  );
};

const render = (_: any, props: any) => {
  const { fieldProps } = props;
  return <ModelSelect {...fieldProps} />;
};

export const modelSelect = {
  render,
  formItemRender: render,
};
export default ModelSelect;
