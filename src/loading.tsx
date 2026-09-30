import { footerHeight, pageTopHeight } from '@/components/Sadmin/helper/functions';
import { useModel, useRouteData } from '@umijs/max';
import { Skeleton } from 'antd';

/**
 * umi 内部给 layout 路由分配的固定 id，
 * 见 src/.umi/core/route.tsx 与 plugin-layout/Layout.tsx:112。
 * 注意不能用 route.isLayout 判断：运行时该字段存在，
 * 但 @umijs/renderer-react 的 IRoute 类型没有声明它，会编译报错。
 */
const LAYOUT_ROUTE_ID = 'ant-design-pro-layout';

export default () => {
  const { initialState } = useModel('@@initialState');

  /**
   * umi 会把 loading.tsx 作为「每一条路由」的 Suspense fallback
   * （见 @umijs/renderer-react/dist/routes.js:81），
   * 而 layout 路由 ant-design-pro-layout 自身也是 React.lazy，
   * 所以刷新页面时本组件会被渲染两次，且位置不同：
   *
   *   A. layout 路由自己的 fallback：route.id === 'ant-design-pro-layout'
   *      此时 ProLayout 还没挂载，页面上没有任何 layout 外壳，
   *      必须按整屏高度渲染，四周留白由 padding 控制。
   *
   *   B. 页面路由的 fallback：route.id 为普通页面 id
   *      此时 ProLayout 已经挂载，需要减掉固定头部和页脚高度。
   *
   * 注：/login 是 layout: false 单独挂在根下的，
   * 它没有 layout，归类到 A（无 layout）符合预期。
   */
  const { route } = useRouteData() || {};
  const hasLayout = route && route?.id !== LAYOUT_ROUTE_ID;

  // 无 layout 时是整屏；有 layout 时减掉 header(46) + 可能存在的页脚(38)
  const height = hasLayout
    ? footerHeight(initialState?.settings, 'page') + pageTopHeight(false)
    : 0;

  return (
    <div
      style={{
        height: hasLayout ? `calc(100vh - ${height}px)` : '100vh',
        display: 'flex',
        flexDirection: 'column',
        // 无 layout 时骨架屏垂直居中；有 layout 时贴顶，跟随内容区
        //justifyContent: hasLayout ? 'flex-start' : 'center',
        // 整屏时给一点外边距，避免骨架屏贴边
        padding: hasLayout ? '16px 0' : 24,
        margin: hasLayout ? '0 -24px' : undefined,
      }}
    >
      <Skeleton style={{ height: '60vh' }} active paragraph={{ rows: 8 }} />
    </div>
  );
};
