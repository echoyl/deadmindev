import type { GetProps } from 'antd';
import { TreeSelect } from 'antd';
import type { FC } from 'react';
import { useContext } from 'react';
import { SaDevContext } from '../../dev';
import { loopMenuLocale } from '../../helpers';

type MenuSelectProps = GetProps<typeof TreeSelect>;

const MenuSelect: FC<MenuSelectProps> = (props) => {
  const { devData } = useContext(SaDevContext);
  const treeData = loopMenuLocale(devData?.allMenus);
  return (
    <TreeSelect
      treeData={treeData}
      treeLine={{ showLeafIcon: true }}
      treeDefaultExpandAll={true}
      allowClear={true}
      placeholder={'请选择菜单'}
      {...props}
    />
  );
};

const MenuSelectRender = (_: any, props: any) => {
  const { fieldProps } = props;
  return <MenuSelect {...fieldProps} />;
};

export const menuSelect = {
  render: MenuSelectRender,
  formItemRender: MenuSelectRender,
};

export default MenuSelect;
