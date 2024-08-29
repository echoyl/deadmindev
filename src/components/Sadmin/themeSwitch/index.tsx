import { MoonOutlined, SunOutlined } from '@ant-design/icons';
import { useModel } from '@umijs/max';
import dayjs from 'dayjs';
import { useContext, useEffect, useState } from 'react';
import { lightDefaultToken } from '../../../../config/defaultSettings';
import { SaDevContext } from '../dev';
import HeaderDropdown from '@/components/HeaderDropdown';

export const getTheme = (adminSetting: { [key: string]: any } | undefined): string => {
  let theme = localStorage.getItem('navTheme');
  //读取配置是否开启了自动黑暗模式
  if (adminSetting && adminSetting.theme_auto_dark && adminSetting.theme_auto_light_time_range) {
    //设置后 优先级更高，手动设置只在设置后生效 刷新页面后 已后台设置为主
    //检测当前时间是否在 后台设置的 白天时间段中
    const now = dayjs().format('HH:mm:ss');
    //console.log(now, adminSetting.theme_auto_light_time_range);
    if (
      now >= adminSetting.theme_auto_light_time_range[0] &&
      now <= adminSetting.theme_auto_light_time_range[1]
    ) {
      theme = 'light';
    } else {
      theme = 'realDark';
    }
  }
  //console.log('now theme is', theme);

  return theme ? theme : 'light';
};

const ThemeSwitch = (props) => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const { style } = props;
  const theme = getTheme(initialState?.settings?.adminSetting);
  //const [checked, setChecked] = useState(theme != 'light' ? true : false);
  const [checked, setChecked] = useState(theme);
  const { setSetting, setting } = useContext(SaDevContext);
  const setTheme = (theme: 'realDark' | 'light' | undefined) => {
    const token = theme == 'light' ? { ...lightDefaultToken } : { sider: {}, header: {} };

    setInitialState((s) => ({
      ...s,
      settings: {
        ...s?.settings,
        navTheme: theme,
        token: { ...s?.settings?.token, ...token },
      },
    })).then(() => {
      //set cache
      setSetting?.({
        ...initialState?.settings,
        navTheme: theme,
        //token: { ...initialState?.settings?.token, ...token },
      });
      localStorage.setItem('navTheme', theme ? theme : 'light');
    });
  };
  useEffect(() => {
    //监听保存配置后 变更主题
    setChecked(setting?.navTheme);
  }, [setting?.navTheme]);

  const onMenuClick = (event: any) => {
    const { key } = event;
    setTheme(key);
  };
  const menuItemStyle = { minWidth: '160px' };

  const menuItems = [
    {
      key: 'light',
      icon: <SunOutlined />,
      label: 'Light',
      style: menuItemStyle,
    },
    {
      key: 'realDark',
      icon: <MoonOutlined />,
      label: 'Dark',
      style: menuItemStyle,
    },
  ];

  return (
    <HeaderDropdown
      menu={{
        selectedKeys: [checked],
        onClick: onMenuClick,
        items: menuItems,
        selectable: true,
      }}
      placement="bottomRight"
    >
      <span style={style}>{menuItems.find((v) => v.key == checked)?.icon}</span>
    </HeaderDropdown>
  );
};
export default ThemeSwitch;
