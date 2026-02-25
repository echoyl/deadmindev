import { SelectLang as UmiSelectLang, useModel } from '@umijs/max';
import { ConfigProvider, theme } from 'antd';
import { useContext } from 'react';
import NoticeIconView from '../NoticeIcon';
import { SaDevContext } from '../Sadmin/dev';
import ThemeSwitch from '../Sadmin/themeSwitch';

export const SelectLang = (props: { style: any }) => {
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
      {props.children}
    </ConfigProvider>
  );
};

export const actionsRender = (settings: Record<string, any>) => {
  const style =
    settings?.layout == 'side' ? { ...actionDefaultStyle, padding: 0 } : actionDefaultStyle;
  return [
    // <DevSwitch key="DevSwitch" />,
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
