import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { ProConfigProvider, SettingDrawer, useBreakpoint } from '@ant-design/pro-components';
import type { RunTimeLayoutConfig } from '@umijs/max';
import { addLocale, getLocale, history } from '@umijs/max';

//import '@ant-design/v5-patch-for-react-19';
import { App, ConfigProvider, Modal, message, notification, theme } from 'antd';
import enUS from 'antd/locale/en_US';
import zhCN from 'antd/locale/zh_CN';
import zhTW from 'antd/locale/zh_TW';

import { loginPath, currentUser as queryCurrentUser } from '@/components/Sadmin/lib/request';
import { createFromIconfontCN } from '@ant-design/icons';
import type { Locale } from 'antd/es/locale';
import type { JSX } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import defaultSettings from '../config/defaultSettings';
import { Footer } from './components';
import { actionsRender } from './components/RightContent';
import { AvatarDropdown } from './components/RightContent/AvatarDropdown';
import LoginModal from './components/Sadmin/components/login';
import { saGetSetting } from './components/Sadmin/components/refresh';
import { DevLinks, SaDevContext } from './components/Sadmin/dev';
import { loopMenuItem, saValueTypeMap } from './components/Sadmin/helpers';
import WebSocketProvider, { WebSocketListen } from './components/Sadmin/hooks/websocket';
import Message from './components/Sadmin/message';

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
    adminSetting?: Record<string, any>;
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
  // console.log('settings', settings);
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
export function rootContainer(container: JSX.Element) {
  const Provider = (props: any) => {
    //const { initialState } = useModel('@@initialState');
    const [setting, setSetting] = useState<any>(defaultSettings);
    const [devData, setDevData] = useState<any>();
    //const [currentLocale, setCurrentLocale] = useState<string>(getLocale());
    const currentLocale = getLocale();
    const [messageApi, messageHolder] = message.useMessage();
    const [modalApi, modalHolder] = Modal.useModal();
    const [notificationApi, notificationHolder] = notification.useNotification();
    //const [admin, setAdmin] = useState<any>();
    const supportLocale: Record<string, Locale> = {
      'en-US': enUS,
      'zh-CN': zhCN,
      'zh-TW': zhTW,
    };
    const colSize = useBreakpoint();

    const isMobile = useMemo(() => {
      return colSize === 'sm' || colSize === 'xs';
    }, [colSize]);

    const contextValue = useMemo(
      () => ({
        setting,
        setSetting,
        messageApi,
        modalApi,
        notificationApi,
        isMobile,
        devData,
        setDevData,
      }),
      [setting, messageApi, modalApi, notificationApi, isMobile, devData],
    );

    useEffect(() => {
      //console.log('root get');
      //dayjs.locale(currentLocale.toLocaleLowerCase());
      saGetSetting().then((v) => {
        const { devData: ddata, ...rest } = v;
        setSetting(rest);
        setDevData(ddata);
        v?.adminSetting?.locales?.map((lo: Record<string, any>) => {
          addLocale(lo.name, lo.configs);
        });
        createFromIconfontCN({
          scriptUrl: v?.adminSetting?.iconfont?.urls?.map((v2: Record<string, any>) => v2.url),
        });

        const element = document.querySelector('#rootLoading');
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
    //自定义外层无法使用 @@initialState
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
          <SaDevContext value={contextValue}>
            {/* <WebSocketProvider>
              <WebSocketListen />
              {props.children}
            </WebSocketProvider> */}
            <WebSocketProvider>{props.children}</WebSocketProvider>
            {messageHolder}
            {modalHolder}
            {notificationHolder}
            <Message />
          </SaDevContext>
        </App>
      </ConfigProvider>
    );
  };
  return React.createElement(Provider, null, container);
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  //const values = useContext(ProProvider);
  const { adminSetting = {}, ...rest } = initialState?.settings || {};
  const checkWaterMark = () => {
    const watermark = adminSetting.watermark;
    if (watermark) {
      return watermark == 'username' ? initialState?.currentUser?.name : watermark;
    } else {
      return false;
    }
  };

  const classNames = [
    adminSetting.siderColor == 'dark' ? 'deadmin-sider-dark' : '',
    adminSetting.siderColor == 'white' ? 'deadmin-sider-white' : '',
    adminSetting.headerColor == 'dark' ? 'deadmin-header-dark' : '',
    adminSetting.headerColor == 'white' ? 'deadmin-header-white' : '',
    initialState?.settings?.layout == 'side' ? 'deadmin-layout-side' : '',
    initialState?.settings?.navTheme == 'light' ? 'deadmin-light' : 'deadmin-dark',
  ];

  const pRender = (props: Record<string, any>, dom: React.ReactNode, type: string) => {
    if (adminSetting[type] == 'dark') {
      return (
        <ProConfigProvider dark={true} token={props.token}>
          {dom}
        </ProConfigProvider>
      );
    }
    return dom;
  };
  const menuRender = (props: Record<string, any>, dom: React.ReactNode) => {
    return pRender(props, dom, 'siderColor');
  };
  const headerRender = (props: Record<string, any>, dom: React.ReactNode) => {
    return pRender(props, dom, 'headerColor');
  };

  return {
    actionsRender,
    avatarProps: {
      src: initialState?.currentUser?.avatar,
      title: initialState?.currentUser?.name,
      render: (_, avatarChildren) => {
        return <AvatarDropdown menu={true}>{avatarChildren}</AvatarDropdown>;
      },
    },
    //disableContentMargin: false,
    waterMarkProps: {
      content: checkWaterMark(),
      gap: [200, 250],
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

    //menuFooterRender: () => (adminSetting.dev ? <DevLinks /> : false),
    //menuHeaderRender: undefined,
    menu: {
      params: initialState?.currentUser?.uidx,
      request: async (params, defaultMenuData) => {
        return loopMenuItem(initialState?.currentUser?.menuData);
      },
      locale: false,
    },
    menuRender,
    headerRender,
    childrenRender: (children, props) => {
      return (
        <ProConfigProvider valueTypeMap={{ ...saValueTypeMap }}>
          <WebSocketListen />
          <LoginModal />
          {children}
          <DevLinks />
          {adminSetting?.dev && (
            <SettingDrawer
              disableUrlParams
              enableDarkTheme
              settings={rest}
              onSettingChange={(settings) => {
                setInitialState((preInitialState) => ({
                  ...preInitialState,
                  settings: { ...preInitialState?.settings, ...settings },
                }));
              }}
            />
          )}
        </ProConfigProvider>
      );
    },
    siderWidth: 200,
    className: classNames.filter((v) => v).join(' '),
    ...initialState?.settings,
  };
};
