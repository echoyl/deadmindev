import cache from '@/components/Sadmin/helper/cache';
import { platformName } from '@/components/Sadmin/lib/request';
import { ProConfigProvider } from '@ant-design/pro-components';
import { SelectLang as UmiSelectLang, useModel } from '@umijs/max';
import { ConfigProvider, Select, theme } from 'antd';
import { useContext, useEffect, useState } from 'react';
import NoticeIconView from '../NoticeIcon';
import { SaDevContext } from '../Sadmin/dev';
import ThemeSwitch from '../Sadmin/themeSwitch';

export const SelectLang = (props: { style?: any }) => {
  const { initialState } = useModel('@@initialState');
  const { style } = props;
  return initialState?.settings?.adminSetting?.lang ? <UmiSelectLang style={style} /> : null;
};

export const actionDefaultStyle = {
  cursor: 'pointer',
  padding: '12px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '16px',
  verticalAlign: 'middle',
};
export const AutoThemeCon = (props: { children: any; name?: string }) => {
  const { setting } = useContext(SaDevContext);
  return (
    <ConfigProvider
      theme={{
        algorithm: setting?.navTheme == 'light' ? theme.defaultAlgorithm : theme.darkAlgorithm,
      }}
    >
      <ProConfigProvider dark={setting?.navTheme == 'light' ? false : true}>
        {props.children}
      </ProConfigProvider>
    </ConfigProvider>
  );
};

export const PlatformSelect = () => {
  const { initialState } = useModel('@@initialState');
  const platforms = initialState?.currentUser?.platforms;
  const [value, setValue] = useState<string>('');

  useEffect(() => {
    cache.get(platformName).then((v) => v && setValue(v));
  }, []);

  useEffect(() => {
    if (platforms?.length === 1) {
      const v = platforms[0].key + '';
      setValue(v);
      cache.set(platformName, v);
    }
  }, [platforms]);

  const darkToken = theme.darkAlgorithm(theme.defaultSeed);
  const { setting } = useContext(SaDevContext);

  if (!platforms || platforms.length < 1) return null;

  const onChange = async (v: string) => {
    if (v == value) return;
    if (v) {
      await cache.set(platformName, v);
    } else {
      await cache.remove(platformName);
    }
    window.location.reload();
  };

  const darkStyle =
    setting?.adminSetting.headerColor == 'dark'
      ? { color: darkToken.colorTextSecondary }
      : undefined;

  return (
    <Select
      style={{ width: 150, paddingTop: 0, paddingBottom: 0, margin: '0 12px' }}
      styles={{
        root: darkStyle,
        placeholder: darkStyle,
        suffix: darkStyle,
        clear: darkStyle,
      }}
      value={value || undefined}
      options={platforms}
      onChange={onChange}
      placeholder="请选择平台"
      fieldNames={{ label: 'label', value: 'key' }}
      allowClear
      size="small"
      variant="borderless"
    />
  );
};

export const actionsRender = (settings: Record<string, any>) => {
  const style =
    settings?.layout == 'side' ? { ...actionDefaultStyle, padding: 0 } : actionDefaultStyle;
  return [
    // <DevSwitch key="DevSwitch" />,
    <AutoThemeCon key="platform">
      <PlatformSelect key="platform" />
    </AutoThemeCon>,
    <AutoThemeCon key="theme">
      <ThemeSwitch style={style} key="ThemeSwitch" />
    </AutoThemeCon>,
    settings?.adminSetting?.lang ? (
      <AutoThemeCon key="lang">
        <SelectLang style={style} key="SelectLang" />
      </AutoThemeCon>
    ) : (
      false
    ),

    <AutoThemeCon key="notice">
      <NoticeIconView style={style} />
    </AutoThemeCon>,
  ].filter((children) => children);
};

export default () => null;
