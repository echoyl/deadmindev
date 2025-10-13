import { SaDevContext } from '@/components/Sadmin/dev';
import { SaBreadcrumbRender, getBread } from '@/components/Sadmin/helpers';
import { PageContainer } from '@ant-design/pro-components';
import { history, useLocation, useModel, useNavigate } from '@umijs/max';
import { Button, Result, theme } from 'antd';
import React, { useContext, useEffect, lazy, Suspense } from 'react';
import Loading from '../Loading';

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

export const Page: React.FC = () => {
  const localtion = useLocation();
  let pathname = localtion.pathname;
  const match = pathname.match(/\/(\d+)$/);

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

  if (!menu) {
    return <NoFoundPage />;
  }

  return (
    <>
      {!menu.data?.redirect ? (
        <PageTypes menu={menu} match={match} pathname={pathname} />
      ) : (
        <PageContainer404>
          <Loading />
        </PageContainer404>
      )}
    </>
  );
};

export const PageContainer404: React.FC<{ [key: string]: any }> = (props) => {
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
        breadcrumbRender: (_, dom) => {
          return <SaBreadcrumbRender match={match} path={path} />;
        },
      }}
    >
      {props.children}
    </PageContainer>
  );
};

const ListPage: React.FC<{ [key: string]: any }> = (props) => {
  const { menu, pathname, name, data, pagetype, ...rest } = props;
  const level = menu?.data?.setting?.level || 0;
  return (
    <Suspense fallback={<Loading />}>
      {pagetype == 'category' || level ? (
        <Category
          pageMenu={menu}
          key={pathname}
          path={pathname}
          name={name}
          {...data}
          tableTitle={false}
        />
      ) : (
        <PostsList
          key={pathname}
          path={pathname}
          name={name}
          pageMenu={menu}
          {...data}
          tableTitle={false}
        />
      )}
    </Suspense>
  );
};

const PageTypes: React.FC<{ [key: string]: any }> = ({ menu, match, pathname }) => {
  const { data, page_type, name } = menu;
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
          pageMenu={menu}
          {...data}
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
        return (
          <ListPage pathname={pathname} menu={menu} name={name} pagetype={page_type} data={data} />
        );
      case 'panel':
        return (
          <Suspense fallback={<Loading />}>
            <PagePanel key={pathname} pageMenu={menu} {...data} path={pathname} />
          </Suspense>
        );
      case 'panel2':
        return (
          <Suspense fallback={<Loading />}>
            <SaPanel key={pathname} pageMenu={menu} {...data} path={pathname} />
          </Suspense>
        );
      default:
        return null;
    }
  }
};

export default Page;
