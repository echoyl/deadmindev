import ConfirmForm from '@/components/Sadmin/action/confirmForm';
import { SaDevContext } from '@/components/Sadmin/dev';
import modelSettingColumns from '@/components/Sadmin/dev/vars/modelSettingColumns';
import cache from '@/components/Sadmin/helper/cache';
import Bmap, { BampShow, BmapInput } from '@/components/Sadmin/map/bmap';
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
    <BmapInput
      lat="116.404"
      lng="39.915"
      //value={[42.89506647538567, 140.73675480831693]}
      mapProps={{
        level: 0,
      }}
      defaultValue={{ lng: 140.73675480831693, lat: 42.89506647538567 }}
      initPoint={{ lng: 116.404, lat: 39.915 }}
      level={0}
    />
  );
}
