import ConfirmForm from '../Sadmin/action/confirmForm';
import { FC } from 'react';
import cache from '../Sadmin/helper/cache';

const LockScreen: FC = (props) => {
  const { open = false, onOpen } = props;
  return (
    <ConfirmForm
      trigger={<></>}
      closable={false}
      open={open}
      onOpen={(open) => {
        onOpen?.(open);
      }}
      modalProps={{
        closable: false,
        styles: { mask: { backgroundColor: 'rgba(0,0,0,0.8)' } },
        height: 400,
      }}
      callback={(ret) => {
        if (!ret.code) {
          //清除记录缓存
          cache.remove('lockscreen');
        }
        return true;
      }}
      afterActionType="reload"
      msg="屏幕已锁定请输入密码解锁"
      postUrl="lockscreen"
      width={400}
      maxHeight={100}
      height={100}
      saFormProps={{ devEnable: false, showTabs: false }}
      tabs={[
        {
          title: 'test',
          formColumns: [
            {
              title: '请输入锁屏密码',
              dataIndex: 'password',
              valueType: 'password',
              formItemProps: {
                rules: [
                  {
                    required: true,
                  },
                ],
              },
              fieldProps: {
                placeholder: '请输入解锁密码',
              },
            },
          ],
        },
      ]}
    />
  );
};

export default LockScreen;
