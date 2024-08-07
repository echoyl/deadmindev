import { SelectLang as UmiSelectLang, useModel } from '@umijs/max';
import React from 'react';
import NoticeIconView from '../NoticeIcon';
import DevSwitch from '../Sadmin/dev/switch';
import ThemeSwitch from '../Sadmin/themeSwitch';

export const SelectLang = () => {
  const { initialState } = useModel('@@initialState');
  return initialState?.settings?.adminSetting?.lang ? <UmiSelectLang /> : null;
};

export const actionsRender = () => {
  return [
    <DevSwitch key="DevSwitch" />,
    <ThemeSwitch key="ThemeSwitch" />,
    <SelectLang key="SelectLang" />,
    <NoticeIconView />,
  ];
};

export default () => null;
