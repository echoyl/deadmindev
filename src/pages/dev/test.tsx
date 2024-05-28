import { SaDevContext } from '@/components/Sadmin/dev';
import modelSettingColumns from '@/components/Sadmin/dev/vars/modelSettingColumns';
import cache from '@/components/Sadmin/helper/cache';
import PostsForm from '@/components/Sadmin/posts/post';
import { useIntl } from '@umijs/max';
import { Button, Space } from 'antd';
import { useContext } from 'react';

export default function App() {
  const { setting } = useContext(SaDevContext);

  const intl = useIntl();
  const msg = intl.formatMessage({
    id: 'locale.menu',
  });
  //console.log('dev setting', setting);
  return (
    <Space>
      <Button
        key="get"
        onClick={async () => {
          const value = await cache.get('test');
          console.log('value', value);
        }}
      >
        {msg}
      </Button>
      <Button
        key="set"
        onClick={() => {
          cache.set('test', { name: 'haha' }, 3);
        }}
      >
        set
      </Button>
    </Space>
  );
}
