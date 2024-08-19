import { actionDefaultStyle } from '@/components/RightContent';
import { HighlightOutlined } from '@ant-design/icons';
import { useModel } from '@umijs/max';
import useToken from 'antd/es/theme/useToken';
import { useState } from 'react';

const DevSwitch = () => {
  const [checked, setChecked] = useState(true);
  const { initialState, setInitialState } = useModel('@@initialState');
  const [theme, token] = useToken();
  const checkedStyle = { backgroundColor: token.colorBgLayout };

  return initialState?.settings?.adminSetting?.dev ? (
    <span
      style={checked ? { ...actionDefaultStyle, ...checkedStyle } : actionDefaultStyle}
      title={checked ? '预览' : '切换至开发模式'}
      onClick={() => {
        const _checked = !checked;
        setChecked(_checked);
        //   const theme = !checked ? 'light' : 'realDark';
        //   const token = !checked ? { ...lightDefaultToken } : { sider: {}, header: {} };
        setInitialState((s) => ({
          ...s,
          settings: {
            ...s?.settings,
            devDisable: checked,
          },
        }));
      }}
    >
      <HighlightOutlined />
    </span>
  ) : null;
};
export default DevSwitch;
