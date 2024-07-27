import { HighlightOutlined } from '@ant-design/icons';
import { useModel } from '@umijs/max';
import { Switch } from 'antd';
import useToken from 'antd/es/theme/useToken';
import { useState } from 'react';

const DevSwitch = () => {
  const [checked, setChecked] = useState(true);
  const { initialState, setInitialState } = useModel('@@initialState');
  const [theme, token] = useToken();
  const checkedStyle = { backgroundColor: token.colorPrimary, color: '#fff' };
  const defaultStyle = {
    padding: '4px 20px',
    fontSize: 16,
    cursor: 'pointer',
    lineHeight: '48px',
    margin: '0 2px',
  };
  return initialState?.settings?.adminSetting?.dev ? (
    <div
      style={checked ? { ...defaultStyle, ...checkedStyle } : defaultStyle}
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
    </div>
  ) : null;
};
export default DevSwitch;
