import { SelectLang as UmiSelectLang, useModel } from '@umijs/max';
import { Space } from 'antd';
import React from 'react';
import NoticeIconView from '../NoticeIcon';
import DevSwitch from '../Sadmin/dev/switch';
import ThemeSwitch from '../Sadmin/themSwitch';
import Avatar from './AvatarDropdown';
import styles from './index.less';
export type SiderTheme = 'light' | 'dark';

const GlobalHeaderRight: React.FC = () => {
  const { initialState } = useModel('@@initialState');

  if (!initialState || !initialState.settings) {
    return null;
  }

  const { navTheme, layout, lang = true } = initialState.settings;
  let className = styles.right;

  if ((navTheme === 'realDark' && layout === 'top') || layout === 'mix') {
    className = `${styles.right}  ${styles.dark}`;
  }

  return (
    <Space className={className}>
      <DevSwitch />
      <ThemeSwitch />

      {lang && (
        <div style={{ padding: '0 4px', height: 48, lineHeight: '46px' }}>
          <UmiSelectLang style={{ padding: 0, fontSize: 16 }} />
        </div>
      )}

      <NoticeIconView />
      <Avatar menu={true} />
      <span> </span>
    </Space>
  );
};

export default GlobalHeaderRight;
