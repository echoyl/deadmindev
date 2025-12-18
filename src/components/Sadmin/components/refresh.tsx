import request, {
  currentUser,
  getAdminSetting,
  messageLoadingKey,
  setAdminSetting,
} from '@/components/Sadmin/lib/request';
import { message } from '@/components/Sadmin/message';
import { SyncOutlined } from '@ant-design/icons';
import { useModel } from '@umijs/max';
import { FloatButton } from 'antd';
import { merge } from 'es-toolkit';
import { useContext, useState } from 'react';
import defaultSettings from '../../../../config/defaultSettings';
import { SaDevContext } from '../dev';
import { uid } from '../helpers';
import { getTheme } from '../themeSwitch';
export const parseAdminSeting: any = (localsetting: { [key: string]: any }) => {
  const theme = getTheme(localsetting);
  const navTheme: { [key: string]: any } =
    theme == 'light' ? { navTheme: theme } : { navTheme: theme };
  //之后会将adpro的设置 存到一个字段下面，

  if (localsetting.title) {
    navTheme.title = localsetting.title;
  }
  if (localsetting.splitMenus) {
    navTheme.splitMenus = localsetting.splitMenus;
  }
  //解析后台配置的antdpro配置
  const { antdpro = {} } = localsetting;
  const { title, logo, navTheme: onavTheme, colorPrimary, token = {}, ...antdproRest } = antdpro;
  const newToken = merge(defaultSettings?.token || {}, token);
  //console.log('localsetting',localsetting);
  if (localsetting.colorPrimary) {
    navTheme.colorPrimary = localsetting.colorPrimary;
  } else {
    if (colorPrimary) {
      navTheme.colorPrimary = colorPrimary;
    }
  }

  return {
    ...defaultSettings,
    adminSetting: localsetting,
    ...navTheme,
    ...antdproRest,
    logo: localsetting.logo,
    token: newToken,
  };
};
export const saGetSetting = async (force: boolean = false): Promise<Record<string, any>> => {
  let localsetting = await getAdminSetting();
  if (force || !localsetting) {
    const { data } = await request.get('setting');
    localsetting = data;
    setAdminSetting(data);
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

export const saReloadSetting = async (initialState, setInitialState, setSetting) => {
  message?.loading({ key: messageLoadingKey, content: '刷新开发数据中' });
  //const msg = await cuser();
  const setting = await saGetSetting(true);
  setInitialState((s) => ({
    ...s,
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
  const [spin, setSpin] = useState(false);
  const reload = async () => {
    setSpin(true);
    await saReload(initialState, setInitialState, setSetting);
    setSpin(false);
  };

  return <FloatButton onClick={reload} icon={<SyncOutlined spin={spin} />} />;
};
