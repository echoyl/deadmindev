import { SyncOutlined } from '@ant-design/icons';
import { useModel } from '@umijs/max';
import { Space } from 'antd';
import { useContext } from 'react';
import defaultSettings, { lightDefaultToken } from '../../../../config/defaultSettings';
import { SaDevContext } from '../dev';
import { uid } from '../helpers';
import { message } from '@/components/Sadmin/message';
import { getTheme } from '../themeSwitch';
import cache from '../helper/cache';
import request, { currentUser, messageLoadingKey } from '@/components/Sadmin/lib/request';
export const parseAdminSeting: any = (localsetting: { [key: string]: any }) => {
  const theme = getTheme(localsetting);
  const navTheme: { [key: string]: any } =
    theme == 'light'
      ? { navTheme: theme, token: { ...lightDefaultToken } }
      : { navTheme: theme, token: { sider: {}, header: {} } };
  //之后会将adpro的设置 存到一个字段下面，
  
  if (localsetting.title) {
    navTheme.title = localsetting.title;
  }
  //解析后台配置的antdpro配置
  const {antdpro = {}} = localsetting;
  const {title,logo,navTheme:onavTheme,colorPrimary,token,...antdproRest} = antdpro;
  //console.log('localsetting',localsetting);
  if (localsetting.colorPrimary) {
    navTheme.colorPrimary = localsetting.colorPrimary;
  }else
  {
    if(colorPrimary)
    {
      navTheme.colorPrimary = colorPrimary;
    }
  }

  return { ...defaultSettings, adminSetting: localsetting, ...navTheme,...antdproRest, logo: localsetting.logo };
};
export const saGetSetting = async (force: boolean = false): Promise<{ [key: string]: any }> => {
  const cacheKey = 'adminSetting';
  let localsetting = await cache.get(cacheKey);
  if (force || !localsetting) {
    const { data } = await request.get('setting');
    localsetting = data;
    cache.set(cacheKey, data, 3600);
  }
  if (!localsetting) {
    return {};
  }

  return parseAdminSeting(localsetting);
};

export const saReload = async (initialState, setInitialState, setSetting) => {
  message?.loading({ key: messageLoadingKey, content: '刷新配置中' });
  const msg = await currentUser();
  //const msg = await cuser();
  const setting = await saGetSetting(true);
  const uidx = uid();
  setInitialState((s) => ({
    ...s,
    currentUser: { ...msg.data, uidx },
    settings: setting,
  })).then(() => {
    setSetting?.({
      ...initialState?.settings,
      ...setting,
    });
    message?.success({ key: messageLoadingKey, content: '刷新成功', duration: 1 });
  });
  return;
};

export const saReloadMenu = async (initialState, setInitialState) => {
  message?.loading({ key: messageLoadingKey, content: '刷新配置中' });
  const msg = await currentUser();
  //const msg = await cuser();
  const uidx = uid();
  setInitialState((s) => ({
    ...s,
    currentUser: { ...msg.data, uidx },
  })).then(() => {
    message?.success({ key: messageLoadingKey, content: '刷新成功', duration: 1 });
  });
  return;
};

export default () => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const { setSetting } = useContext(SaDevContext);

  const reload = async () => {
    await saReload(initialState, setInitialState, setSetting);
  };

  return (
    <span onClick={reload} style={{ width: '100%', textAlign: 'center', display: 'inline-block' }}>
      <Space>
        <SyncOutlined />
        刷新
      </Space>
    </span>
  );
};
