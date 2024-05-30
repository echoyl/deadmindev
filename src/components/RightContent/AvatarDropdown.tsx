import { loginOut } from '@/services/ant-design-pro/sadmin';
import { LogoutOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import { history, useIntl, useModel } from '@umijs/max';
import { Spin } from 'antd';
import { createStyles } from 'antd-style';
import { stringify } from 'querystring';
import React, { useCallback, useContext } from 'react';
import { flushSync } from 'react-dom';
import HeaderDropdown from '../HeaderDropdown';
import { messageLoadingKey } from '@/services/ant-design-pro/sadmin';
import { t } from '../Sadmin/helpers';
import { SaDevContext } from '../Sadmin/dev';

export type GlobalHeaderRightProps = {
  menu?: boolean;
  children?: React.ReactNode;
};

export const AvatarName = () => {
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  return <span className="anticon">{currentUser?.name}</span>;
};

const useStyles = createStyles(({ token }) => {
  return {
    action: {
      display: 'flex',
      height: '48px',
      marginLeft: 'auto',
      overflow: 'hidden',
      alignItems: 'center',
      padding: '0 8px',
      cursor: 'pointer',
      borderRadius: token.borderRadius,
      '&:hover': {
        backgroundColor: token.colorBgTextHover,
      },
    },
  };
});

export const AvatarDropdown: React.FC<GlobalHeaderRightProps> = ({ menu, children }) => {
  /**
   * 退出登录，并且将当前的 url 保存
   */
  const { styles } = useStyles();
  const intl = useIntl();

  const { initialState, setInitialState } = useModel('@@initialState');
  const { messageApi } = useContext(SaDevContext);

  const onMenuClick = useCallback(
    (event: any) => {
      const { key } = event;
      if (key === 'logout') {
        messageApi?.loading({
          content: t('component.globalHeader.avatar.logouting', intl),
          duration: 0,
          key: messageLoadingKey,
        });
        loginOut(() => {
          messageApi?.info({
            key: messageLoadingKey,
            content: t('component.globalHeader.avatar.logoutsuccess', intl),
            duration: 1,
          });
          setInitialState((s) => ({ ...s, currentUser: undefined }));
        });

        return;
      } else {
        history.push(`/dashboard/${key}`);
      }
    },
    [setInitialState],
  );

  const loading = (
    <span className={styles.action}>
      <Spin
        size="small"
        style={{
          marginLeft: 8,
          marginRight: 8,
        }}
      />
    </span>
  );

  if (!initialState) {
    return loading;
  }

  const { currentUser } = initialState;

  if (!currentUser || !currentUser.name) {
    return loading;
  }

  const menuItems = [
    ...(menu
      ? [
          {
            key: 'user',
            icon: <SettingOutlined />,
            label: t('component.globalHeader.avatar.user'),
          },
          {
            type: 'divider' as const,
          },
        ]
      : []),
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('component.globalHeader.avatar.logout'),
    },
  ];

  return (
    <HeaderDropdown
      menu={{
        selectedKeys: [],
        onClick: onMenuClick,
        items: menuItems,
      }}
    >
      {children}
    </HeaderDropdown>
  );
};
