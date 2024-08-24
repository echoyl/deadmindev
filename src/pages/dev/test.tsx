import { TampShow } from '@/components/Sadmin/map/tmap';
import { MenuFoldOutlined } from '@ant-design/icons';
import { FloatButton } from 'antd';
import { useState } from 'react';

export default function App() {
  const [open, setOpen] = useState(false);
  //console.log('dev setting', setting);

  const path = [
    [39.98481500648338, 116.30571126937866],
    [39.982266575222155, 116.30596876144409],
    [39.982348784165886, 116.3111400604248],
    [39.978813710266024, 116.3111400604248],
    [39.978813710266024, 116.31699800491333],
  ];

  return <TampShow lat="39.984104" lng="116.307503" markerCenter={false} path={path} zoom={15} />;
}
