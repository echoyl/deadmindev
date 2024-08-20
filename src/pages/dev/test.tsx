import { MenuFoldOutlined } from '@ant-design/icons';
import { FloatButton } from 'antd';
import { useState } from 'react';

export default function App() {
  const [open, setOpen] = useState(false);
  //console.log('dev setting', setting);
  return (
    <FloatButton.Group open={open} trigger="click" onOpenChange={(open) => setOpen(open)}>
      <FloatButton icon={<MenuFoldOutlined />} />
    </FloatButton.Group>
  );
}
