import { HighlightOutlined } from '@ant-design/icons';
import { useModel } from '@umijs/max';
import { Button, FloatButton } from 'antd';
import { useState, useEffect } from 'react';

const DevSwitch = (props: Record<string, any>) => {
  const { type = 'float' } = props;
  const [checked, setChecked] = useState(true);
  const { setInitialState, initialState } = useModel('@@initialState');
  const click = () => {
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
  };
  useEffect(() => {
    setChecked(!initialState?.settings?.devDisable);
  }, [initialState?.settings?.devDisable]);
  return (
    <>
      {type == 'float' ? (
        <FloatButton
          icon={<HighlightOutlined />}
          type={checked ? 'primary' : 'default'}
          // style={checked ? { ...checkedStyle } : {}}
          // title={checked ? '预览' : '切换至开发模式'}
          onClick={click}
        />
      ) : (
        <Button
          onClick={click}
          icon={<HighlightOutlined />}
          type={checked ? 'primary' : 'default'}
        />
      )}
    </>
  );
};
export default DevSwitch;
