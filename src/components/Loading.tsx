import { footerHeight, pageTopHeight } from '@/components/Sadmin/helper/functions';
import { useModel } from '@umijs/max';
import { Skeleton } from 'antd';

export default () => {
  const { initialState } = useModel('@@initialState');
  //页面内的loading 高度全屏并设置padding
  return (
    <div
      style={{
        height: `calc(100vh - ${
          footerHeight(initialState?.settings, 'page') + pageTopHeight(false)
        }px)`,
        padding: '24px 0',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Skeleton active paragraph={{ rows: 8 }} />
    </div>
  );
};
