import { SelectLang as UmiSelectLang, useModel } from '@umijs/max';
import React from 'react';
import NoticeIconView from '../NoticeIcon';
import DevSwitch from '../Sadmin/dev/switch';
import ThemeSwitch from '../Sadmin/themeSwitch';

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

export const actionsRender = (settings) => {
  const style =
    settings?.layout == 'side' ? { ...actionDefaultStyle, padding: 0 } : actionDefaultStyle;
  return [
    // <DevSwitch key="DevSwitch" />,
    <ThemeSwitch style={style} key="ThemeSwitch" />,
    settings?.adminSetting?.lang ? <SelectLang style={style} key="SelectLang" /> : false,
    <NoticeIconView style={style} />,
  ].filter((children) => children);
};

export default () => null;
