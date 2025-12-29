import HeaderDropdown from '@/components/HeaderDropdown';
import { GlobalOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons';
import { useModel } from '@umijs/max';
import dayjs from 'dayjs';
import { useContext, useEffect, useState } from 'react';
import { lightDefaultToken } from '../../../../config/defaultSettings';
import { SaDevContext } from '../dev';

type ThemeType = 'realDark' | 'light' | undefined;

const getCheckedValue = (local: any, adminSetting: Record<string, any>): string => {
  const systemOpen = adminSetting?.theme_auto_dark && adminSetting?.theme_auto_light_time_range;
  if (local) {
    return local == 'system' ? (systemOpen ? 'system' : 'light') : local;
  } else {
    return systemOpen ? 'system' : 'light';
  }
};

export const getTheme = (
  adminSetting: Record<string, any> | undefined,
  itheme: ThemeType = undefined,
): ThemeType => {
  let theme = itheme ? itheme : localStorage.getItem('navTheme');
  const systemOpen = adminSetting?.theme_auto_dark && adminSetting?.theme_auto_light_time_range;
  //读取配置是否开启了自动黑暗模式
  if (adminSetting && (theme == 'system' || !theme)) {
    if (systemOpen) {
      //设置后 优先级更高，手动设置只在设置后生效 刷新页面后 已后台设置为主
      //检测当前时间是否在 后台设置的 白天时间段中
      const now = dayjs().format('HH:mm:ss');
      if (
        now >= adminSetting.theme_auto_light_time_range[0] &&
        now <= adminSetting.theme_auto_light_time_range[1]
      ) {
        theme = 'light';
      } else {
        theme = 'realDark';
      }
    } else {
      //设置关闭自动模式后，如果之前选的是system的话 需要自动修改为light
      theme = 'light';
    }
  }
  return theme ? (theme as ThemeType) : 'light';
};

function getLocalStorageItemSync(key: string) {
  return new Promise((resolve, reject) => {
    try {
      const item = localStorage.getItem(key);
      resolve(item);
    } catch (error) {
      reject(error);
    }
  });
}

const ThemeSwitch = (props: Record<string, any>) => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const { setSetting, setting } = useContext(SaDevContext);
  const { style } = props;
  //const theme = getTheme(initialState?.settings?.adminSetting);
  const { adminSetting } = setting || {};
  const [checked, setChecked] = useState<string>('');
  const [localChecked, setLocalChecked] = useState<any>();
  const [realTheme, setRealTheme] = useState(setting?.navTheme);

  const setTheme = (theme: 'realDark' | 'light' | undefined) => {
    const token = theme == 'light' ? { ...lightDefaultToken } : { sider: {} };
    const cal_theme = getTheme(initialState?.settings?.adminSetting, theme);
    setInitialState((s) => ({
      ...s,
      settings: {
        ...s?.settings,
        navTheme: cal_theme,
        token: { ...s?.settings?.token, ...token },
      },
    })).then(() => {
      //set cache
      setSetting?.({
        ...initialState?.settings,
        navTheme: cal_theme,
        navThemeVar: theme,
        //token: { ...initialState?.settings?.token, ...token },
      });
      const local = theme ? theme : 'light';
      localStorage.setItem('navTheme', local);
      setLocalChecked(local);
    });
  };
  useEffect(() => {
    getLocalStorageItemSync('navTheme').then((v) => {
      setLocalChecked(v);
      const defalutValue = getCheckedValue(v, adminSetting);
      setChecked(defalutValue);
    });
  }, []);
  useEffect(() => {
    //监听保存配置后 变更主题
    const defalutValue = getCheckedValue(
      setting?.navThemeVar ? setting?.navThemeVar : localChecked,
      adminSetting,
    );
    setChecked(setting?.navThemeVar ? setting?.navThemeVar : defalutValue);
    setRealTheme(setting?.navTheme);
  }, [
    setting?.navThemeVar,
    setting?.navTheme,
    adminSetting?.theme_auto_dark,
    adminSetting?.theme_auto_light_time_range,
  ]);

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

  if (setting?.adminSetting.theme_auto_dark) {
    menuItems.push({
      key: 'system',
      icon: <GlobalOutlined />,
      label: 'System',
      style: menuItemStyle,
    });
  }

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
      <span style={style}>{menuItems.find((v) => v.key == realTheme)?.icon}</span>
    </HeaderDropdown>
  );
};
export default ThemeSwitch;
