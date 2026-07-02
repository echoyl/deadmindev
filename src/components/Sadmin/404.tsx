import { SaDevContext } from '@/components/Sadmin/dev';
import { getBread, SaBreadcrumbRender } from '@/components/Sadmin/helpers';
import { MenuDataItem, PageContainer } from '@ant-design/pro-components';
import { history, useLocation, useModel, useNavigate } from '@umijs/max';
import { Button, Result, theme } from 'antd';
import React, {
  createContext,
  lazy,
  Suspense,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import Loading from '../Loading';
import { useAdminStore } from './dev/context';
import Markdown from './posts/markdown';

const PagePanel = lazy(() => import('@/components/Sadmin/pagePanel'));
const PostsList = lazy(() => import('@/components/Sadmin/posts'));
const Category = lazy(() => import('@/components/Sadmin/posts/category'));
const PostsForm = lazy(() => import('@/components/Sadmin/posts/post'));
const SaPanel = lazy(() => import('@/components/Sadmin/dev/panel'));

const NoFoundPage: React.FC = () => (
  // <Result
  //   status="404"
  //   title="404"
  //   subTitle="Sorry, the page you visited does not exist."
  //   extra={
  //     <Button type="primary" onClick={() => history.push('/')}>
  //       Back Home
  //     </Button>
  //   }
  // />
  <Result
    status="403"
    title="403"
    subTitle="你没有此页面的访问权限"
    extra={
      <Button type="primary" onClick={() => history.push('/')}>
        返回工作台
      </Button>
    }
  />
);

export const PageContainer404: React.FC<Record<string, any>> = (props) => {
  const { title = false, match = false, path } = props;
  const { setting } = useContext(SaDevContext);
  const { initialState } = useModel('@@initialState');
  const { useToken } = theme;
  const { token } = useToken();
  const style = {
    backgroundColor: token.colorBgContainer,
    transition: 'background-color 0.3s',
    boxShadow: token.boxShadowTertiary,
  };
  useEffect(() => {
    //初始化滚动条位置，如果当前页面滚动到了底部，则跳转页面后应该重置
    //console.log('reset scrollto');
    window.scrollTo({ top: 0 });
  }, []);
  return (
    <PageContainer
      title={title}
      fixedHeader={setting?.fixedHeader}
      className="saContainer"
      affixProps={
        setting?.layout == 'side' && setting?.fixedHeader
          ? {
              offsetTop: 0,
              style: { marginTop: -1 },
            }
          : {
              offsetTop: initialState?.settings?.token?.header?.heightLayoutHeader,
            }
      }
      header={{
        style: setting?.layout == 'side' && setting?.fixedHeader ? style : {},
        breadcrumbRender: () => {
          return <SaBreadcrumbRender match={match} path={path} />;
        },
      }}
    >
      {props.children}
    </PageContainer>
  );
};

export const SaPageContext = createContext<{
  pageMenu?: (MenuDataItem & Record<string, any>) | null;
  setPageMenu?: (data: Record<string, any>) => void;
}>({});

// 用 path+data 的序列化 key 检测内容是否真正变化，避免新引用导致死循环，
// 同时确保 path 不变但 data 更新时（如 designer 保存配置）也能传递到内部
export function usePageMenu(menu: any): [any, (data: any) => void] {
  const [pageMenu, setPageMenu] = useState<any>(menu);
  const preMenuKeyRef = useRef('');
  let menuKey = '';
  try { menuKey = menu ? menu.path + '|' + JSON.stringify(menu.data) : ''; } catch {}
  if (menuKey && menuKey !== preMenuKeyRef.current) {
    if (preMenuKeyRef.current) setPageMenu(menu);
    preMenuKeyRef.current = menuKey;
  }
  return [pageMenu, setPageMenu];
}

const ListPage: React.FC<Record<string, any>> = (props) => {
  const { pathname, name, data, pagetype } = props;
  const level = data?.setting?.level || 0;

  return (
    <Suspense fallback={<Loading />}>
      {pagetype == 'category' || (level && pagetype != 'xmarkdown') ? (
        <Category key={pathname} path={pathname} name={name} {...data} tableTitle={false} />
      ) : pagetype == 'xmarkdown' ? (
        <Markdown key={pathname} path={pathname} name={name} {...data} tableTitle={false} />
      ) : (
        <PostsList key={pathname} path={pathname} name={name} {...data} tableTitle={false} />
      )}
    </Suspense>
  );
};

const PageTypes: React.FC<Record<string, any>> = ({ match, pathname }) => {
  const { pageMenu } = useContext(SaPageContext);
  const { data, page_type, name } = pageMenu || {};

  //console.log('menu is', menu);
  if (match || page_type == 'form') {
    //post 页面
    //console.log('post page param is', data, page_type);
    const url =
      data.postUrl || data.url
        ? (data.postUrl ? data.postUrl : data.url + '/show') + (match ? '?id=' + match?.[1] : '')
        : '';
    return (
      <Suspense fallback={<Loading />}>
        <PostsForm
          formTitle={false}
          key={pathname}
          match={match ? true : false}
          {...data}
          width={data?.setting?.formWidth}
          msgcls={({ code }) => {
            if (!data.noBack) {
              if (!code) {
                if (page_type != 'form') {
                  //如果页面类型是form的话不做后退操作
                  history.back();
                }
              }
            }
          }}
          url={url}
          dataId={match ? match?.[1] : 0}
        />
      </Suspense>
    );
  } else {
    switch (page_type) {
      case 'category':
      case 'table':
      case 'justTable':
      case 'xmarkdown':
        return <ListPage pathname={pathname} name={name} pagetype={page_type} data={data} />;
      case 'panel':
        return (
          <Suspense fallback={<Loading />}>
            <PagePanel key={pathname} {...data} path={pathname} />
          </Suspense>
        );
      case 'panel2':
        return (
          <Suspense fallback={<Loading />}>
            <SaPanel key={pathname} {...data} path={pathname} />
          </Suspense>
        );
      default:
        return null;
    }
  }
};

const Page: React.FC = () => {
  const localtion = useLocation();
  let pathname = localtion.pathname;
  const match = pathname.match(/\/(\d+)$/);
  const pageKey = useAdminStore((state) => state.pageKey);
  //检测路由是否包含数字
  if (match) {
    pathname = localtion.pathname.replace(match[0], '');
  }
  const { initialState } = useModel('@@initialState');
  const menu = getBread(pathname, initialState?.currentUser);
  const navigate = useNavigate();

  useEffect(() => {
    if (!menu) {
      return;
    }

    if (menu.data?.redirect) {
      //history.push(menu.data?.redirect);
      navigate(menu.data?.redirect, { replace: true });
    } else {
      if (menu.path != pathname) {
        //如果有跳转页面 和当前页面路径不一样，则跳转路由
        history.push(menu.path as string);
      }
    }
  }, [localtion]);

  const [pageMenu, setPageMenu] = usePageMenu(menu);
  if (!menu) {
    return <NoFoundPage />;
  }

  // console.log('top menu is', menu);
  return menu ? (
    !menu.data?.redirect ? (
      <SaPageContext value={{ pageMenu, setPageMenu }}>
        <PageTypes key={pageKey} match={match} pathname={pathname} />
      </SaPageContext>
    ) : (
      <PageContainer404>
        <Loading />
      </PageContainer404>
    )
  ) : (
    <NoFoundPage />
  );
};

export default Page;
