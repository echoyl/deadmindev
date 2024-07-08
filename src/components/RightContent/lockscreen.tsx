import ConfirmForm from '../Sadmin/action/confirmForm';
import { FC, useEffect, useState } from 'react';
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
      }}
      callback={(ret) => {
        if (!ret.code) {
          //清除记录缓存
          cache.remove('lockscreen');
        }
        return true;
      }}
      afterActionType="none"
      msg="屏幕已锁定请输入密码解锁"
      postUrl="lockscreen"
      saFormProps={{ devEnable: false }}
      tabs={[
        {
          title: 'test',
          formColumns: [
            {
              title: '',
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
