import LoadingFullHeight from './components/LoadingFullHeight';
// export default () => {
//   return <LoadingFullHeight />;
// };
import { footerHeight, pageTopHeight } from '@/components/Sadmin/helper/functions';
import { useModel } from '@umijs/max';

export default () => {
  const { initialState } = useModel('@@initialState');
  const height = footerHeight(initialState?.settings, 'page') + pageTopHeight(false);
  //页面内的loading 高度全屏并设置padding
  return (
    <div
      style={{
        height: `calc(100vh - ${height}px)`,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <LoadingFullHeight />
    </div>
  );
};
