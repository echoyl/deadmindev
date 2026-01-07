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
export const parseAdminSeting: any = (localsetting: Record<string, any>) => {
  const { devData, ...restLocalsetting } = localsetting;
  const theme = getTheme(localsetting);
  const navTheme: Record<string, any> =
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
    adminSetting: restLocalsetting,
    ...navTheme,
    ...antdproRest,
    logo: localsetting.logo,
    token: newToken,
    devData,
  };
};

/**
 * 重新读取后台setting配置信息 会存储在缓存中
 * @param force 是否强制刷新 会重新请求后端数据
 * @returns
 */
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

/**
 * 刷新配置信息，刷新后会重新加载用户信息及开发配置信息
 * @param param0
 * @returns
 */
export const saReload = async ({
  initialState,
  setInitialState,
  setSetting,
  setDevData,
}: Record<string, any> = {}) => {
  message?.loading({ key: messageLoadingKey, content: '刷新配置中' });
  const msg = await currentUser();
  //const msg = await cuser();
  const { devData, ...setting } = await saGetSetting(true);
  const uidx = uid();
  setInitialState?.((s: any) => ({
    ...s,
    currentUser: { ...msg.data, uidx },
    settings: setting,
  })).then(() => {
    setSetting?.({
      ...initialState?.settings,
      ...setting,
    });
    setDevData?.(devData);
    message?.success({ key: messageLoadingKey, content: '刷新成功', duration: 1 });
  });
  return;
};

/**
 * 刷新用户信息 编辑菜单后调用可刷新左侧菜单信息
 * @param param0
 * @returns
 */
export const saReloadMenu = async ({ setInitialState }: Record<string, any> = {}) => {
  message?.loading({ key: messageLoadingKey, content: '刷新配置中' });
  const msg = await currentUser();
  //const msg = await cuser();
  const uidx = uid();
  setInitialState?.((s: any) => ({
    ...s,
    currentUser: { ...msg.data, uidx },
  })).then(() => {
    message?.success({ key: messageLoadingKey, content: '刷新成功', duration: 1 });
  });
  return;
};

export const saReloadModel = (
  { devData, setDevData }: Record<string, any> = {},
  model: Record<string, any>,
) => {
  if (!model) {
    return;
  }
  const flushModelData = () => {
    const index = devData?.allModels?.findIndex((item: Record<string, any>) => item.id == model.id);
    const allModels = [...(devData?.allModels || [])];
    if (allModels.length < 1) {
      return;
    }
    if (index != -1) {
      allModels[index] = model;
    } else {
      allModels.push(model);
    }
    const newDevData = {
      ...devData,
      allModels,
    };
    getAdminSetting().then((adminSetting) => {
      const newAdminSetting = {
        ...adminSetting,
        devData: newDevData,
      };
      setAdminSetting(newAdminSetting);
      setDevData?.(newDevData);
    });
  };
  request.get(`dev/formatFile/${model.id}`).then(() => flushModelData());
};

export default () => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const { setSetting, setDevData } = useContext(SaDevContext);
  const [spin, setSpin] = useState(false);
  const reload = async () => {
    setSpin(true);
    await saReload({ initialState, setInitialState, setSetting, setDevData });
    setSpin(false);
  };

  return <FloatButton onClick={reload} icon={<SyncOutlined spin={spin} />} />;
};
