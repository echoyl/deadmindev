import { SaDevContext } from '@/components/Sadmin/dev';
import { SaBreadcrumbRender, getBread } from '@/components/Sadmin/helpers';
import { PageContainer, PageLoading } from '@ant-design/pro-components';
import { history, useLocation } from '@umijs/max';
import { Button, Result } from 'antd';
import React, { useContext, useEffect, lazy, Suspense } from 'react';

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
  //log('data', localtion, param, breadcrumb);
  let pathname = localtion.pathname;
  const match = pathname.match(/\/(\d+)$/);
  //const { initialState } = useModel('@@initialState');

  //检测路由是否包含数字
  if (match) {
    //log('has number', match[1]);
    pathname = localtion.pathname.replace(match[0], '');
  } else {
    //log('dont has number');
  }

  const menu = getBread(pathname);
  if (!menu) {
    return <NoFoundPage />;
  }
  useEffect(() => {
    //console.log('404 menu change', menu);
    if (menu.data?.redirect) {
      history.push(menu.data?.redirect);
    }
  }, [menu]);

  return (
    <>
      {!menu.data?.redirect ? (
        <PageTypes menu={menu} match={match} pathname={pathname} />
      ) : (
        <PageLoading />
      )}
    </>
  );
};

export const PageContainer404 = (props) => {
  const { title = false, match = false, path } = props;
  const { setting } = useContext(SaDevContext);
  return (
    <PageContainer
      title={title}
      fixedHeader={setting?.fixedHeader}
      className="saContainer"
      affixProps={setting?.layout == 'side' ? { offsetTop: 0, style: { marginTop: -1 } } : {}}
      header={{
        breadcrumbRender: (_, dom) => {
          return <SaBreadcrumbRender match={match} path={path} />;
        },
      }}
    >
      {props.children}
    </PageContainer>
  );
};

const PageTypes = ({ menu, match, pathname }) => {
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
      <Suspense fallback={<PageLoading />}>
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
        return (
          <Suspense fallback={<PageLoading />}>
            <Category
              pageMenu={menu}
              key={pathname}
              path={pathname}
              name={name}
              {...data}
              tableTitle={false}
            />
          </Suspense>
        );
      case 'table':
      case 'justTable':
        return (
          <Suspense fallback={<PageLoading />}>
            <PostsList
              key={pathname}
              path={pathname}
              name={name}
              pageMenu={menu}
              {...data}
              tableTitle={false}
            />
          </Suspense>
        );
      case 'panel':
        return (
          <Suspense fallback={<PageLoading />}>
            <PagePanel pageMenu={menu} {...data} path={pathname} />
          </Suspense>
        );
      case 'panel2':
        return (
          <Suspense fallback={<PageLoading />}>
            <SaPanel pageMenu={menu} {...data} path={pathname} />
          </Suspense>
        );
      default:
        return null;
    }
  }
};

export default Page;
