import { Footer, RightContent } from '@/components';
import {
  Settings as LayoutSettings,
  ProConfigProvider,
  ProProvider,
  SettingDrawer,
} from '@ant-design/pro-components';
import { RunTimeLayoutConfig, history } from '@umijs/max';
import { App, ConfigProvider, Modal, message } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import React, { useContext, useEffect, useState } from 'react';
import { DevLinks, SaDevContext } from './components/Sadmin/dev';
import { loopMenuItem, saValueTypeMap } from './components/Sadmin/helpers';
import WebSocketProvider, { WebSocketListen } from './components/Sadmin/hooks/websocket';
import Message from './components/Sadmin/message';
import { saGetSetting } from './components/Sadmin/refresh';
import { loginPath, currentUser as queryCurrentUser } from './services/ant-design-pro/sadmin';
dayjs.locale('zh-cn');
//const isDev = process.env.NODE_ENV === 'development';

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings> & {
    baseurl?: string;
    loginTypeDefault?: string;
    loginBgImgage?: string;
    dev?: { [key: string]: any } | boolean;
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
  if (history.location.pathname.replace(settings.baseurl, '/') !== loginPath) {
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
    const [setting, setSetting] = useState<any>();
    //const [admin, setAdmin] = useState<any>();
    useEffect(() => {
      //console.log('root get');
      saGetSetting().then((v) => {
        setSetting(v);
        // if (history.location.pathname.replace(v.baseurl, '/') !== loginPath) {
        //   queryCurrentUser().then(({ code, data }) => {
        //     if (!code) {
        //       setAdmin(data);
        //     }
        //   });
        // }
      });
    }, []);
    const components = {
      Menu: {
        subMenuItemBg: 'transparent',
      },
      ...setting?.antdtheme?.components,
    };
    return (
      <ConfigProvider
        theme={
          setting?.navTheme == 'light'
            ? {
                ...setting?.antdtheme,
                components,
              }
            : {}
        }
      >
        <App>
          <SaDevContext.Provider
            value={{
              //setting: initialState?.settings,
              setting,
              setSetting,
            }}
          >
            <WebSocketProvider>{props.children}</WebSocketProvider>
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
  const values2 = useContext(SaDevContext);
  const checkWaterMark = () => {
    if (initialState?.settings?.watermark) {
      return initialState?.settings?.watermark == 'username'
        ? initialState?.currentUser?.name
        : initialState?.settings?.watermark;
    } else {
      return false;
    }
  };
  return {
    rightContentRender: () => <RightContent />,
    //disableContentMargin: false,
    waterMarkProps: {
      content: checkWaterMark(),
    },
    footerRender: () => <Footer />,
    onPageChange: () => {
      // 如果没有登录，重定向到 login
      const pathname = history.location.pathname.replace(initialState?.settings?.baseurl, '/');
      if (!initialState?.currentUser && pathname !== loginPath) {
        console.log('no user');
        history.push({
          pathname: loginPath,
          search: '?redirect=' + history.location.pathname,
        });
      }
    },
    layoutBgImgList: [],

    menuFooterRender: () => (initialState?.settings.dev ? <DevLinks /> : false),
    //menuHeaderRender: undefined,
    menu: {
      params: initialState?.currentUser?.uid,
      request: async (params, defaultMenuData) => {
        return loopMenuItem(initialState?.currentUser?.menuData);
      },
      locale: false,
    },
    childrenRender: (children, props) => {
      const [messageApi, messageHolder] = message.useMessage();
      const [modalApi, modalHolder] = Modal.useModal();
      return (
        <ProConfigProvider {...values} valueTypeMap={{ ...saValueTypeMap }}>
          <SaDevContext.Provider
            value={{
              ...values2,
              messageApi,
              modalApi,
            }}
          >
            {messageHolder}
            {modalHolder}

            <WebSocketListen />
            {children}
            {initialState?.settings.dev && !props.location?.pathname?.includes('/login') && (
              <SettingDrawer
                disableUrlParams
                enableDarkTheme
                settings={initialState?.settings}
                onSettingChange={(settings) => {
                  setInitialState((preInitialState) => ({
                    ...preInitialState,
                    settings: { ...preInitialState.settings, ...settings },
                  }));
                }}
              />
            )}
          </SaDevContext.Provider>
        </ProConfigProvider>
      );
    },
    siderWidth: 208,
    className: initialState?.settings?.navTheme == 'light' ? 'deadminLight' : 'deadminDark',
    ...initialState?.settings,
  };
};
