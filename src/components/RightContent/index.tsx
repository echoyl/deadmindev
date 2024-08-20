import { SelectLang as UmiSelectLang, useModel } from '@umijs/max';
import React from 'react';
import NoticeIconView from '../NoticeIcon';
import DevSwitch from '../Sadmin/dev/switch';
import ThemeSwitch from '../Sadmin/themeSwitch';

export const SelectLang = () => {
  const { initialState } = useModel('@@initialState');
  return initialState?.settings?.adminSetting?.lang ? (
    <UmiSelectLang style={actionDefaultStyle} />
  ) : null;
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
  return [
    // <DevSwitch key="DevSwitch" />,
    <ThemeSwitch key="ThemeSwitch" />,
    settings?.adminSetting?.lang ? <SelectLang key="SelectLang" /> : false,
    <NoticeIconView />,
  ].filter((children) => children);
};

export default () => null;
