import cache from '@/components/Sadmin/helper/cache';
import { platformName } from '@/components/Sadmin/lib/request';
import { DownOutlined } from '@ant-design/icons';
import { ProConfigProvider } from '@ant-design/pro-components';
import { SelectLang as UmiSelectLang, useModel } from '@umijs/max';
import { ConfigProvider, Dropdown, Space, theme } from 'antd';
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
export const AutoThemeCon = (props: { children: any }) => {
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

const PlatformSelect = ({ style }: { style?: React.CSSProperties }) => {
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

  if (!platforms || platforms.length < 1) return null;

  const cur = platforms.find((p: any) => p.key == value);

  const handleSelect = async (v: string) => {
    if (v == value) return;
    if (v) {
      await cache.set(platformName, v);
    } else {
      await cache.remove(platformName);
    }
    window.location.reload();
  };

  const items = platforms.map((p: any) => ({
    ...p,
    onClick: () => handleSelect(p.key + ''),
  }));

  if (platforms.length > 1) {
    items.push({ type: 'divider' }, { key: '', label: '清除', onClick: () => handleSelect('') });
  }

  return (
    <Dropdown
      menu={{ items, selectable: true, selectedKeys: value ? [value] : undefined }}
      placement="bottomRight"
      trigger={['click']}
    >
      <span style={{ ...style, fontSize: '14px', color: '#fff' }}>
        <Space>
          {cur?.label || '选择平台'}
          <DownOutlined />
        </Space>
      </span>
    </Dropdown>
  );
};

export const actionsRender = (settings: Record<string, any>) => {
  const style =
    settings?.layout == 'side' ? { ...actionDefaultStyle, padding: 0 } : actionDefaultStyle;
  return [
    // <DevSwitch key="DevSwitch" />,
    <AutoThemeCon key="platform">
      <PlatformSelect key="platform" style={style} />
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
