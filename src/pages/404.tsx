import SaPanel from '@/components/Sadmin/dev/panel';
import { getBread } from '@/components/Sadmin/helpers';
import PagePanel from '@/components/Sadmin/pagePanel';
import PostsList from '@/components/Sadmin/posts';
import Category from '@/components/Sadmin/posts/category';
import PostsForm from '@/components/Sadmin/posts/post';
import { PageLoading } from '@ant-design/pro-components';
import { history, useLocation } from '@umijs/max';
import { Button, Result } from 'antd';
import React, { useEffect } from 'react';

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

const Page: React.FC = () => {
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
      <PostsForm
        key={pathname}
        formTitle={false}
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
        match={match ? true : false}
        dataId={match ? match?.[1] : 0}
      />
    );
  } else {
    switch (page_type) {
      case 'category':
        return (
          <Category
            pageMenu={menu}
            key={pathname}
            path={pathname}
            name={name}
            {...data}
            tableTitle={false}
          />
        );
      case 'table':
      case 'justTable':
        return (
          <PostsList
            key={pathname}
            path={pathname}
            name={name}
            pageMenu={menu}
            {...data}
            tableTitle={false}
          />
        );
      case 'panel':
        return <PagePanel pageMenu={menu} {...data} path={pathname} />;
      case 'panel2':
        return <SaPanel pageMenu={menu} {...data} path={pathname} />;
      default:
        return null;
    }
  }
};

export default Page;
