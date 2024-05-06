import { Dropdown } from 'antd';
import type { DropDownProps } from 'antd/es/dropdown';
import React from 'react';

export type HeaderDropdownProps = {
  overlayClassName?: string;
  placement?: 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topCenter' | 'topRight' | 'bottomCenter';
} & Omit<DropDownProps, 'overlay'>;

const HeaderDropdown: React.FC<HeaderDropdownProps> = ({ overlayClassName: cls, ...restProps }) => {
  return (
    <Dropdown
      //overlayClassName={classNames(className, cls)}
      overlayClassName={cls}
      overlayStyle={{
        background: '#fff',
        borderRadius: 4,
        boxShadow:
          '0 6px 16px -8px rgba(0,0,0,.08), 0 9px 28px 0 rgba(0,0,0,.05), 0 12px 48px 16px rgba(0,0,0,.03)',
      }}
      {...restProps}
    />
  );
};

export default HeaderDropdown;
