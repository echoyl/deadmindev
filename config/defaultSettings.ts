import { ProLayoutProps } from '@ant-design/pro-components';

/**
 * 默认的亮色主题暂时的配置
 */
export const lightDefaultToken = {};

const Settings: ProLayoutProps & {
  pwa?: boolean;
  logo?: string;
  baseurl?: string;
} = {
  navTheme: 'light',
  // 拂晓蓝
  colorPrimary: '#006eff',
  layout: 'mix',
  contentWidth: 'Fluid',
  fixedHeader: true,
  fixSiderbar: true,
  colorWeak: false,
  title: 'Admin',
  pwa: false,
  logo: '',
  iconfontUrl: '',
  token: {
    // 参见ts声明，demo 见文档，通过token 修改样式
    //https://procomponents.ant.design/components/layout#%E9%80%9A%E8%BF%87-token-%E4%BF%AE%E6%94%B9%E6%A0%B7%E5%BC%8F
    // sider: {
    //   colorBgMenuItemSelected: '#e6f4ff',
    //   colorMenuBackground: '#ffffff',
    //   colorTextMenuSelected: '#1890ff',
    //   colorBgMenuItemHover: 'rgba(90, 75, 75, 0.03)',
    //   colorTextMenu: 'rgba(0, 0, 0, 0.88)',
    //   colorTextMenuActive: '#1890ff',
    //   colorBgMenuItemCollapsedElevated: '#ffffff',
    // },
    // header: {
    //   colorTextMenuActive: '#1890ff',
    //   colorTextMenu: 'rgba(0, 0, 0, 0.88)',
    //   colorBgMenuItemSelected: '#e6f4ff',
    //   colorTextMenuSelected: '#1890ff',
    //   colorBgMenuItemHover: 'rgba(90, 75, 75, 0.03)',
    // },
    header: { heightLayoutHeader: 46 },
    // pageContainer: {
    //   paddingInlinePageContainerContent: 20,
    //   //paddingBlockPageContainerContent: 0,
    // },
  },
};

export default Settings;
