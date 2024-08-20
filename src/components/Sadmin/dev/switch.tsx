import { HighlightOutlined } from '@ant-design/icons';
import { useModel } from '@umijs/max';
import { FloatButton } from 'antd';
import { useState } from 'react';

const DevSwitch = () => {
  const [checked, setChecked] = useState(true);
  const { setInitialState } = useModel('@@initialState');
  return (
    <FloatButton
      icon={<HighlightOutlined />}
      type={checked ? 'primary' : 'default'}
      // style={checked ? { ...checkedStyle } : {}}
      // title={checked ? '预览' : '切换至开发模式'}
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
    />
  );
};
export default DevSwitch;
