import request, { currentUser, messageLoadingKey } from '@/services/ant-design-pro/sadmin';
import { SyncOutlined } from '@ant-design/icons';
import { useModel } from '@umijs/max';
import { Space } from 'antd';
import { useContext } from 'react';
import defaultSettings, { lightDefaultToken } from '../../../config/defaultSettings';
import { SaDevContext } from './dev';
import { uid } from './helpers';

import { getTheme } from './themSwitch';
import cache from './helper/cache';
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

  const theme = getTheme(localsetting);
  const navTheme =
    theme == 'light'
      ? { navTheme: theme, token: { ...lightDefaultToken } }
      : { navTheme: theme, token: { sider: {}, header: {} } };

  return { ...defaultSettings, ...localsetting, ...navTheme };
};

export const saReload = async (initialState, setInitialState, setSetting, messageApi) => {
  messageApi?.loading({ key: messageLoadingKey, content: '刷新配置中' });
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
    messageApi?.success({ key: messageLoadingKey, content: '刷新成功', duration: 1 });
  });
  return;
};

export const saReloadMenu = async (initialState, setInitialState, messageApi) => {
  messageApi?.loading({ key: messageLoadingKey, content: '刷新配置中' });
  const msg = await currentUser();
  //const msg = await cuser();
  const uidx = uid();
  setInitialState((s) => ({
    ...s,
    currentUser: { ...msg.data, uidx },
  })).then(() => {
    messageApi?.success({ key: messageLoadingKey, content: '刷新成功', duration: 1 });
  });
  return;
};

export default () => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const { setSetting, messageApi } = useContext(SaDevContext);

  const reload = async () => {
    await saReload(initialState, setInitialState, setSetting, messageApi);
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
