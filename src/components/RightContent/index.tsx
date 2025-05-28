import { SelectLang as UmiSelectLang, useModel } from '@umijs/max';
import React, { useContext } from 'react';
import NoticeIconView from '../NoticeIcon';
import ThemeSwitch from '../Sadmin/themeSwitch';
import { SaDevContext } from '../Sadmin/dev';
import { ConfigProvider, theme } from 'antd';

export const SelectLang = (props) => {
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
export const AutoThemeCon = (props) => {
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

export const actionsRender = (settings) => {
  const style =
    settings?.layout == 'side' ? { ...actionDefaultStyle, padding: 0 } : actionDefaultStyle;
  return [
    // <DevSwitch key="DevSwitch" />,
    <AutoThemeCon>
      <ThemeSwitch style={style} key="ThemeSwitch" />
    </AutoThemeCon>,
    settings?.adminSetting?.lang ? (
      <AutoThemeCon>
        <SelectLang style={style} key="SelectLang" />
      </AutoThemeCon>
    ) : (
      false
    ),

    <AutoThemeCon>
      <NoticeIconView style={style} />
    </AutoThemeCon>,
  ].filter((children) => children);
};

export default () => null;
