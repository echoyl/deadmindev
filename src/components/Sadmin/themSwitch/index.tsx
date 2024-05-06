import Icon from '@ant-design/icons';
import type { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';
import { useModel } from '@umijs/max';
import { Segmented } from 'antd';
import dayjs from 'dayjs';
import { useContext, useState } from 'react';
import { lightDefaultToken } from '../../../../config/defaultSettings';
import { SaDevContext } from '../dev';
const MoonIconSvg = () => (
  <svg viewBox="0 0 16 16" width="1em" height="1em" fill="currentColor">
    <path d="M8.218 1.455c3.527.109 6.327 3.018 6.327 6.545 0 3.6-2.945 6.545-6.545 6.545a6.562 6.562 0 0 1-6.036-4h.218c3.6 0 6.545-2.945 6.545-6.545 0-.91-.182-1.745-.509-2.545m0-1.455c-.473 0-.909.218-1.2.618-.29.4-.327.946-.145 1.382.254.655.4 1.31.4 2 0 2.8-2.291 5.09-5.091 5.09h-.218c-.473 0-.91.22-1.2.62-.291.4-.328.945-.146 1.38C1.891 14.074 4.764 16 8 16c4.4 0 8-3.6 8-8a7.972 7.972 0 0 0-7.745-8h-.037Z"></path>
  </svg>
);
const SunIconSvg = () => (
  <svg viewBox="0 0 16 16" width="1em" height="1em" fill="currentColor">
    <path d="M8 13a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1ZM8 3a1 1 0 0 1-1-1V1a1 1 0 1 1 2 0v1a1 1 0 0 1-1 1Zm7 4a1 1 0 1 1 0 2h-1a1 1 0 1 1 0-2h1ZM3 8a1 1 0 0 1-1 1H1a1 1 0 1 1 0-2h1a1 1 0 0 1 1 1Zm9.95 3.536.707.707a1 1 0 0 1-1.414 1.414l-.707-.707a1 1 0 0 1 1.414-1.414Zm-9.9-7.072-.707-.707a1 1 0 0 1 1.414-1.414l.707.707A1 1 0 0 1 3.05 4.464Zm9.9 0a1 1 0 0 1-1.414-1.414l.707-.707a1 1 0 0 1 1.414 1.414l-.707.707Zm-9.9 7.072a1 1 0 0 1 1.414 1.414l-.707.707a1 1 0 0 1-1.414-1.414l.707-.707ZM8 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0 6.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"></path>
  </svg>
);

const MoonIcon = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={MoonIconSvg} {...props} />
);

const SunIcon = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={SunIconSvg} {...props} />
);

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

const ThemeSwitch = () => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const theme = getTheme(initialState?.settings);
  //const [checked, setChecked] = useState(theme != 'light' ? true : false);
  const [checked, setChecked] = useState(theme);
  const { setSetting } = useContext(SaDevContext);
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
  return (
    <Segmented
      options={[
        { value: 'light', icon: <SunIcon /> },
        { value: 'realDark', icon: <MoonIcon /> },
      ]}
      value={checked}
      onChange={(v: any) => {
        setChecked(v);
        setTheme(v);
      }}
    />
  );
};
export default ThemeSwitch;
