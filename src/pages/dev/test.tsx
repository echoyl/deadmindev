import ConfirmForm from '@/components/Sadmin/action/confirmForm';
import { SaDevContext } from '@/components/Sadmin/dev';
import modelSettingColumns from '@/components/Sadmin/dev/vars/modelSettingColumns';
import cache from '@/components/Sadmin/helper/cache';
import PostsForm from '@/components/Sadmin/posts/post';
import { useIntl } from '@umijs/max';
import { Button, Modal, Space } from 'antd';
import { useContext, useState } from 'react';

export default function App() {
  const { setting } = useContext(SaDevContext);
  const [open, setOpen] = useState<boolean>();
  const intl = useIntl();
  const msg = intl.formatMessage({
    id: 'locale.menu',
  });
  //console.log('dev setting', setting);
  return (
    <ConfirmForm
      trigger={<Button>test</Button>}
      closable={false}
      modalProps={{
        closable: false,
        styles: { mask: { backgroundColor: 'rgba(0,0,0,0.8)' } },
      }}
      callback={(ret) => {
        console.log(ret);
        return true;
      }}
      afterActionType="none"
      msg="屏幕已锁定请输入密码解锁"
      postUrl="lockscreen"
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
}
