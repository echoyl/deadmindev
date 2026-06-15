import { PageContainer404 } from '@/components/Sadmin/404';
import { getFromObject, search2Obj } from '@/components/Sadmin/helpers';
import { EditOutlined, SyncOutlined } from '@ant-design/icons';
import { useModel, useSearchParams } from '@umijs/max';
import type { Anchor, GetProp } from 'antd';
import { Affix, Button, Card, Empty, Flex, Layout, Space } from 'antd';
import type { Key } from 'react';
import React, { useContext, useEffect, useState } from 'react';
import ConfirmForm from '../action/confirmForm';
import { isNumberLike } from '../checkers';
import { SaDevContext } from '../dev';
import { useTableDesigner } from '../dev/table/designer';
import { toolBarRender } from '../dev/table/toolbar';
import { fullPageHeight, getFirstChild, pageTopHeight } from '../helper/functions';
import request from '../lib/request';
import { MarkdownRender } from '../valueTypeMap';
import DocAnchor, { getAnchors } from '../valueTypeMap/markdown/DocAnchor';
import './style.less';
import { SaContext, type saTableProps } from './table';
import TreeMenu from './treeMenu';
const { Content, Sider } = Layout;

const Markdown: React.FC<saTableProps> = (props) => {
  const {
    tableTitle = false,
    path,
    leftMenu,
    setting,
    url = '',
    pageMenu: oPageMenu,
    openType,
    editable = true, //是否可编辑
    addable = true, //是否可以新增
    deleteable = true, //是否可以删除
    devEnable = true,
  } = props;
  const {
    title: treeTitle = '目录',
    url_name: category_id_name = 'id',
    field = { key: 'id', title: 'title', children: 'children' },
    close: leftMenuClose = true,
    span = 200,
    mdAnchorLevel = 3,
    paragraphTag = 'p',
    contentMaxWidth, //内容最大宽度
    ...treeMenuRest
  } = setting?.leftMenu || leftMenu || { close: true };
  const { isMobile } = useContext(SaDevContext);
  const [pageMenu, setPageMenu] = useState<Record<string, any> | undefined>(oPageMenu);
  const page = pageMenu?.id;
  const [categorys, setCategorys] = useState<any[]>([]);
  const { initialState } = useModel('@@initialState');
  //const setUrlSearch = useUrlSearchParams({}, { disabled: false })[1];
  const [searchParams, setUrlSearch] = useSearchParams();

  //console.log(searchParams, 333);
  const searchCategoryId = searchParams.get(category_id_name);
  const numberFormat = (num: string | null) => {
    if (!num) {
      return 0;
    }
    return Number.isNaN(num) ? num : parseInt(num);
  };
  const [category_id, setKey] = useState<Key>(numberFormat(searchCategoryId));
  //指定的id，使用单页，即无左侧菜单使用
  const oid = getFromObject(oPageMenu, ['data', category_id_name]);

  const [mdContent, setMdContent] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [mdContentAnchors, setMdContentAnchors] = useState<GetProp<typeof Anchor, 'items'>>([]); //markdown内容中的锚点信息

  //获取单个元素的内容信息
  const getMdContent = (item: Record<string, any>) => {
    setLoading(true);
    setMdContentAnchors([]);
    request.get(url + '/show', { params: item }).then(({ code, data }) => {
      if (!code) {
        setMdContent(data);
        setLoading(false);
      }
    });
  };

  useEffect(() => {
    //解析data.content中的markdown锚点信息
    if (mdAnchorLevel > 1) {
      const anchors = getAnchors(mdContent.content, mdAnchorLevel > 6 ? 6 : mdAnchorLevel);
      //console.log('anchors', anchors);
      setMdContentAnchors(anchors.length > 1 ? anchors : anchors[0]?.children || []); //一般一个页面只有一个h1，所以直接使用第一个元素的子元素作为锚点信息
    }
  }, [mdContent, mdAnchorLevel]);

  const onSelect = (keys: Key[], info: Record<string, any>) => {
    if (!keys || !keys.length) {
      return;
    }
    if (info.node?.link) {
      //是外链 则跳转链接
      window.open(info.node.link, '_blank');
      return;
    }
    const key = keys.length > 0 ? keys[keys.length - 1] : 0;
    setKey(key);
    const url_search_obj = search2Obj([category_id_name]);
    if (key) {
      url_search_obj[category_id_name] = key + '';
    }
    setUrlSearch({ ...url_search_obj });
    //将body的srolltop设置为0
    window.scrollTo({ top: 0 });
    getMdContent({ id: key });
  };
  const getData = () => {
    if (oid) {
      //如果页面设定了某个独立的id，则直接返回该id
      const data = [{ id: oid }];
      setCategorys(data);
      return Promise.resolve({ data });
    }
    return request.get(url).then((res) => {
      const { code, data } = res;
      if (!code) {
        setCategorys(data);
        return res;
      } else {
        return [];
      }
    });
  };
  const init = (data: any[]) => {
    const firstChild = getFirstChild(data, field.children);
    if (firstChild) {
      getMdContent({ id: firstChild.id });
      setKey(firstChild.id);
    } else {
      setLoading(false);
    }
  };
  //const location = useLocation();
  useEffect(() => {
    const id = searchParams.get(category_id_name);
    if (!id && !category_id) {
      return;
    }
    window.scrollTo({ top: 0 });
    if (!id) {
      init(categorys);
      return;
    }
    if (id != category_id) {
      //切换了id，重新加载数据
      const key = numberFormat(id);
      setKey(key);
      getMdContent({ id: key });
    }
  }, [searchParams]);
  useEffect(() => {
    //获取后台数据
    getData().then((res) => {
      //获取第一个子菜单的内容
      if (category_id) {
        //如果链接参数中已经选中，直接读取该内容 否则读取第一个子元素的信息
        getMdContent({ id: category_id });
      } else {
        init(res.data);
      }
    });
  }, []);
  const onReload = (data: Record<string, any>, type?: string) => {
    //修改或新增手机后重新拉取tree数据 //如果id=当前的id还需要重载当前id的数据信息
    getData().then((res) => {
      if (type == 'edit') {
        if (category_id == data.id) {
          getMdContent({ id: data.id });
        }
      } else if (type == 'delete') {
        init(res.data);
      }
    });
  };
  const baseHeight = fullPageHeight(initialState?.settings);
  const fixedHeader = initialState?.settings?.fixedHeader;
  const topHeight = pageTopHeight(fixedHeader);
  const [siderHeight, setSiderHeight] = useState(baseHeight);
  const siderStyle: React.CSSProperties = {
    //overflow: 'auto',
    height: `calc(100vh - ${siderHeight}px)`,
    //width: `calc(${(span * 100) / 24}%)`,
    //height: '100vh',
    //position: 'fixed',
    // insetInlineStart: 0,
    //top: 0,
  };
  //console.log('pageMenu', pageMenu);
  const toolBar = toolBarRender({
    addable: false,
    devEnable,
    initRequest: true,
    initialState,
    pageMenu,
    enums: { id: category_id },
  })?.();
  const tableDesigner = useTableDesigner({
    pageMenu,
    setPageMenu,
    devEnable,
  });
  //定义 actionRef 其中有 reload方法

  return (
    <PageContainer404 title={tableTitle} path={path}>
      <SaContext.Provider
        value={{
          url,
          tableDesigner,
          actionRef: {
            current: {
              reload: (ret: any) => {
                getMdContent({ id: category_id, ...ret?.data });
              },
            },
          },
        }}
      >
        {/* <Row gutter={[30, 0]} style={!leftMenuClose ? { marginLeft: 0 } : {}}> */}
        <Layout hasSider>
          {!leftMenuClose && !isMobile && (
            <Affix
              offsetTop={topHeight}
              onChange={(affixed) => {
                if (!fixedHeader) {
                  if (affixed) {
                    //如果bread未固定顶部，当前sider固定到顶部时高度要加上当前bread的高度
                    setSiderHeight(baseHeight - 43);
                  } else {
                    setSiderHeight(baseHeight);
                  }
                }
              }}
            >
              <Sider style={siderStyle} width={span}>
                <TreeMenu
                  treeData={categorys}
                  onSelect={onSelect}
                  fieldNames={field}
                  selectedKeys={category_id ? [category_id] : []}
                  title={treeTitle}
                  page={page}
                  onReload={onReload}
                  showType={openType}
                  onlyChildCanBeSelected={true}
                  showClearSelected={false}
                  maxLevel={pageMenu?.data?.setting?.level}
                  addable={addable}
                  deleteable={deleteable}
                  editable={editable}
                  bodyHeight={`calc(100vh - ${siderHeight + 56}px)`}
                  {...treeMenuRest}
                />
              </Sider>
            </Affix>
          )}
          <Content style={!leftMenuClose && !isMobile ? { marginLeft: 1 } : undefined}>
            <Card
              loading={loading}
              variant="borderless"
              title={mdContent?.title}
              extra={
                <Space>
                  {editable && (
                    <ConfirmForm
                      page={page}
                      trigger={<Button icon={<EditOutlined />} />}
                      dataId={category_id}
                      callback={({ code, data }) => {
                        //修改或添加成功后需要刷新页面中的数据
                        if (!code) {
                          onReload?.(data, 'edit');
                        }
                        return true;
                      }}
                      showType="drawer"
                      key="editmarkdown"
                    />
                  )}
                  <Button
                    onClick={() => getMdContent({ id: category_id })}
                    icon={<SyncOutlined />}
                  />
                  <Flex gap="small">{toolBar}</Flex>
                </Space>
              }
              styles={{
                root: {
                  minHeight: `calc(100vh - ${baseHeight}px)`,
                  ...(mdAnchorLevel > 1 && !isMobile && mdContentAnchors.length > 0
                    ? { marginInlineEnd: 142 }
                    : undefined),
                },
              }}
            >
              {mdContent?.content ? (
                <MarkdownRender
                  paragraphTag={paragraphTag}
                  style={
                    contentMaxWidth
                      ? {
                          maxWidth: isNumberLike(contentMaxWidth)
                            ? `${contentMaxWidth}px`
                            : contentMaxWidth,
                          margin: '0 auto',
                        }
                      : undefined
                  }
                >
                  {mdContent.content}
                </MarkdownRender>
              ) : (
                <Flex justify="center" align="center">
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                </Flex>
              )}
            </Card>
            {mdAnchorLevel > 1 && !isMobile && mdContentAnchors.length > 0 && (
              <DocAnchor anchors={mdContentAnchors} />
            )}
          </Content>
        </Layout>
      </SaContext.Provider>
    </PageContainer404>
  );
};

export default Markdown;
