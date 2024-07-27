import { Footer } from '@/components';
import {
  Settings as LayoutSettings,
  ProConfigProvider,
  ProProvider,
  SettingDrawer,
} from '@ant-design/pro-components';
import { RunTimeLayoutConfig, history, getLocale, addLocale } from '@umijs/max';

import { App, ConfigProvider, Modal, message, notification, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import zhTW from 'antd/locale/zh_TW';

import React, { useContext, useEffect, useState } from 'react';
import { DevLinks, SaDevContext } from './components/Sadmin/dev';
import { loopMenuItem, saValueTypeMap } from './components/Sadmin/helpers';
import WebSocketProvider, { WebSocketListen } from './components/Sadmin/hooks/websocket';
import Message from './components/Sadmin/message';
import { saGetSetting } from './components/Sadmin/components/refresh';
import { loginPath, currentUser as queryCurrentUser } from '@/components/Sadmin/lib/request';
import { Locale } from 'antd/es/locale';
import { actionsRender } from './components/RightContent';
import { AvatarDropdown, AvatarName } from './components/RightContent/AvatarDropdown';
import defaultSettings from '../config/defaultSettings';

//const isDev = process.env.NODE_ENV === 'development';
// export default defineConfig({
//   define: {
//     REACT_APP_API_BASEURL: 'http://xxx.test/api',
//     UMI_APP_API_BASEURL: 'http://xxx.test/api',
//   },
// });
/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings> & {
    adminSetting?: { [key: string]: any };
    [key: string]: any;
  };
  currentUser?: API.CurrentUser;
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
}> {
  const fetchUserInfo = async () => {
    try {
      const msg = await queryCurrentUser();
      //const msg = await cuser();
      return msg.data;
    } catch (error) {
      console.log('no login');
      //系统请求已经添加了如果未登录跳转逻辑
      //history.push(loginPath);
    }
    return undefined;
  };
  //获取后台基础配置信息
  const settings = await saGetSetting();
  //const { data: adminSetting } = await request.get('setting');

  // 如果是登录页面，不执行
  //const location = useLocation();
  // console.log(
  //   '获取用户登录信息',
  //   loginPath,
  //   history.location.pathname.replace(adminSetting.baseurl, '/'),
  // );
  if (history.location.pathname.replace(settings.adminSetting?.baseurl, '/') !== loginPath) {
    const currentUser = await fetchUserInfo();
    return {
      fetchUserInfo,
      currentUser,
      settings,
    };
  }
  return {
    fetchUserInfo,
    settings,
  };
}

/**
 * 最外层的context
 * @param container
 * @returns
 */
export function rootContainer(container: JSX.Element, args) {
  // console.log('args', args);
  // args.plugin.hooks.getInitialState[0]().then((v) => {
  //   console.log('v', v);
  // });

  const Provider = (props) => {
    //const { initialState } = useModel('@@initialState');
    const [setting, setSetting] = useState<any>(defaultSettings);
    const [currentLocale, setCurrentLocale] = useState<string>(getLocale());
    const [messageApi, messageHolder] = message.useMessage();
    const [modalApi, modalHolder] = Modal.useModal();
    const [notificationApi, notificationHolder] = notification.useNotification();
    //const [admin, setAdmin] = useState<any>();
    const supportLocale: { [key: string]: Locale } = {
      'en-US': enUS,
      'zh-CN': zhCN,
      'zh-TW': zhTW,
    };
    useEffect(() => {
      //console.log('root get');
      //dayjs.locale(currentLocale.toLocaleLowerCase());
      saGetSetting().then((v) => {
        setSetting(v);
        v?.adminSetting?.locales?.map((lo) => {
          addLocale(lo.name, lo.configs);
        });

        var element = document.querySelector('#rootLoading');
        if (element) {
          console.log('remove loading force');
          element.parentNode?.removeChild(element);
          // 或者
          // element.remove();
        }
        // if (history.location.pathname.replace(v.baseurl, '/') !== loginPath) {
        //   queryCurrentUser().then(({ code, data }) => {
        //     if (!code) {
        //       setAdmin(data);
        //     }
        //   });
        // }
      });
    }, []);
    return (
      <ConfigProvider
        locale={supportLocale[currentLocale]}
        theme={
          setting?.navTheme == 'light'
            ? {
                ...setting?.adminSetting?.antdtheme,
                token: {
                  colorPrimary: setting?.colorPrimary,
                },
                components: {
                  Menu: {
                    subMenuItemBg: 'transparent',
                  },
                  ...setting?.adminSetting?.antdtheme?.components,
                },
              }
            : {
                token: {
                  colorPrimary: setting?.colorPrimary,
                },
                algorithm: theme.darkAlgorithm,
              }
        }
      >
        <App>
          <SaDevContext.Provider
            value={{
              //setting: initialState?.settings,
              setting,
              setSetting,
              messageApi,
              modalApi,
              notificationApi,
            }}
          >
            {/* <WebSocketProvider>
              <WebSocketListen />
              {props.children}
            </WebSocketProvider> */}
            {props.children}
            {messageHolder}
            {modalHolder}
            {notificationHolder}
            <Message />
          </SaDevContext.Provider>
        </App>
      </ConfigProvider>
    );
  };
  return React.createElement(Provider, null, container);
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  const values = useContext(ProProvider);
  const { adminSetting, ...rest } = initialState?.settings;
  const checkWaterMark = () => {
    const watermark = adminSetting?.watermark;
    if (watermark) {
      return watermark == 'username' ? initialState?.currentUser?.name : watermark;
    } else {
      return false;
    }
  };

  return {
    actionsRender: actionsRender,
    avatarProps: {
      src: initialState?.currentUser?.avatar,
      title: <AvatarName />,
      render: (_, avatarChildren) => {
        return <AvatarDropdown menu={true}>{avatarChildren}</AvatarDropdown>;
      },
    },
    //disableContentMargin: false,
    waterMarkProps: {
      content: checkWaterMark(),
    },
    footerRender: () => <Footer />,
    onPageChange: () => {
      // 如果没有登录，重定向到 login
      const pathname = history.location.pathname.replace(adminSetting?.baseurl, '/');
      if (!initialState?.currentUser && pathname !== loginPath) {
        console.log('no user');
        history.push({
          pathname: loginPath,
          search: '?redirect=' + history.location.pathname,
        });
      }
    },
    layoutBgImgList: [],

    menuFooterRender: () => (adminSetting.dev ? <DevLinks /> : false),
    //menuHeaderRender: undefined,
    menu: {
      params: initialState?.currentUser?.uidx,
      request: async (params, defaultMenuData) => {
        return loopMenuItem(initialState?.currentUser?.menuData);
      },
      locale: false,
    },
    childrenRender: (children, props) => {
      return (
        <ProConfigProvider {...values} valueTypeMap={{ ...saValueTypeMap }}>
          <WebSocketProvider>
            <WebSocketListen />
            {children}
          </WebSocketProvider>
          {adminSetting.dev && !props.location?.pathname?.includes('/login') && (
            <SettingDrawer
              disableUrlParams
              enableDarkTheme
              settings={rest}
              onSettingChange={(settings) => {
                setInitialState((preInitialState) => ({
                  ...preInitialState,
                  settings: { ...preInitialState.settings, ...settings },
                }));
              }}
            />
          )}
        </ProConfigProvider>
      );
    },
    siderWidth: 208,
    className: initialState?.settings?.navTheme == 'light' ? 'deadminLight' : 'deadminDark',
    ...initialState?.settings,
  };
};
