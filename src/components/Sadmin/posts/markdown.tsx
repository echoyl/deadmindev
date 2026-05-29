import { PageContainer404 } from '@/components/Sadmin/404';
import { search2Obj } from '@/components/Sadmin/helpers';
import { EditOutlined, SyncOutlined } from '@ant-design/icons';
import { useModel, useSearchParams } from '@umijs/max';
import type { Anchor, GetProp } from 'antd';
import { Affix, Button, Card, Empty, Flex, Layout, Space } from 'antd';
import type { Key } from 'react';
import React, { useEffect, useState } from 'react';
import ConfirmForm from '../action/confirmForm';
import { useTableDesigner } from '../dev/table/designer';
import { toolBarRender } from '../dev/table/toolbar';
import { fullPageHeight, getFirstChild, pageTopHeight } from '../helper/functions';
import request from '../lib/request';
import { MarkdownRender } from '../valueTypeMap';
import DocAnchor from '../valueTypeMap/markdown/DocAnchor';
import './style.less';
import { SaContext, type saTableProps } from './table';
import TreeMenu from './treeMenu';
const { Content, Sider } = Layout;
/**
 * 获取 markdown 内容中的锚点信息
 * @param content markdown 内容
 * @param maxLevel 获取的最大层级
 * @returns
 */
const getAnchors = (markdownContent: string, maxLevel = 3) => {
  if (!markdownContent) return [];

  //需要先将content中的代码块标签去除后再开始匹配
  const codeBlockRegex = /^```[^\n]*\n[\s\S]*?\n^```/gm;
  const content = markdownContent.replace(codeBlockRegex, '');

  const headingRe = /^(\#{1,6})\s{1}(.+)$/gm;
  const headings: { level: number; title: string; slug: string; href: string }[] = [];
  const slugCounts: Record<string, number> = {};
  let m: RegExpExecArray | null;

  const normalizeTitle = (raw: string) =>
    raw
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/!\[.*?\]\(.*?\)/g, '')
      .replace(/`(.+?)`/g, '')
      .replace(/[*_~]/g, '')
      .trim();

  const findPreviousNonEmptyLine = (idx: number) => {
    // 找出当前位置之前最近的非空行文本
    const before = content.slice(0, idx);
    const lines = before.split(/\r?\n/);
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim();
      if (line) return line;
    }
    return '';
  };

  const extractAnchorName = (line: string) => {
    // 匹配 <a ... name="xxx" ...> 或 name='xxx'
    const nameMatch = line.match(/<a\b[^>]*\bname\s*=\s*['"]([^'"]+)['"][^>]*>/i);
    if (nameMatch && nameMatch[1]) return nameMatch[1];
    // 兼容 id 属性或 id/name 混用的情况
    const idMatch = line.match(/<a\b[^>]*\bid\s*=\s*['"]([^'"]+)['"][^>]*>/i);
    if (idMatch && idMatch[1]) return idMatch[1];
    return null;
  };

  while ((m = headingRe.exec(content)) !== null) {
    const hashes = m[1];
    const level = hashes.length;
    if (level > maxLevel) continue;
    const raw = m[2].trim();
    const title = normalizeTitle(raw) || 'heading';

    // 先尝试从上一行的 <a name="..."> 中获取锚点
    const prevLine = findPreviousNonEmptyLine(m.index);
    const anchorName = extractAnchorName(prevLine);

    let base = '';
    if (anchorName) {
      base = String(anchorName)
        .toLowerCase()
        .replace(/^\s*#/, '')
        //.replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
    } else {
      base = title
        .toLowerCase()
        //.replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s&\s/g, '-')
        .replace(/\s+/g, '-');
    }

    let slug = base || 'heading';
    if (slugCounts[slug] && !anchorName) {
      //如果没有a标签锚点则需要增加slug的计数
      slugCounts[slug] += 1;
      slug = `${slug}-${slugCounts[slug]}`;
    } else {
      slugCounts[slug] = 1;
    }

    headings.push({ level, title, slug, href: `#${slug}` });
  }

  // 构建层级树
  const root: any[] = [];
  const stack: any[] = [];

  for (const h of headings) {
    const node = { key: h.slug, href: h.href, title: h.title, children: [] };
    const lvl = h.level;

    if (lvl === 1) {
      root.push(node);
      stack[1] = node;
      for (let i = 2; i <= 6; i++) stack[i] = undefined;
    } else {
      let parent: any | undefined;
      for (let l = lvl - 1; l >= 1; l--) {
        if (stack[l]) {
          parent = stack[l];
          break;
        }
      }
      if (parent) {
        parent.children.push(node);
      } else {
        root.push(node);
      }
      stack[lvl] = node;
      for (let i = lvl + 1; i <= 6; i++) stack[i] = undefined;
    }
  }

  return root;
};

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
    close: leftMenuClose = false,
    span = 200,
    mdAnchorLevel = 3,
    ...treeMenuRest
  } = setting?.leftMenu || leftMenu || { close: true };
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

  const [mdContent, setMdContent] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [mdContentAnchors, setMdContentAnchors] = useState<GetProp<typeof Anchor, 'items'>>([]); //markdown内容中的锚点信息

  //获取单个元素的内容信息
  const getMdContent = (item: Record<string, any>) => {
    setLoading(true);
    setMdContentAnchors([]);
    const params = {
      id: item.id,
    };
    request.get(url + '/show', { params }).then(({ code, data }) => {
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
    return request.get(url).then((res) => {
      setCategorys(res.data);
      return res;
    });
  };
  const init = (data: any[]) => {
    const firstChild = getFirstChild(data, field.children);
    if (firstChild) {
      getMdContent(firstChild);
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
          getMdContent(data);
        }
      } else if (type == 'delete') {
        init(res.data);
      }
    });
  };
  const baseHeight = fullPageHeight(initialState?.settings);
  const topHeight = pageTopHeight();
  const siderStyle: React.CSSProperties = {
    //overflow: 'auto',
    height: `calc(100vh - ${baseHeight}px)`,
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
              reload: () => {
                getMdContent({ id: category_id });
              },
            },
          },
        }}
      >
        {/* <Row gutter={[30, 0]} style={!leftMenuClose ? { marginLeft: 0 } : {}}> */}
        <Layout hasSider>
          {!leftMenuClose && (
            <Affix offsetTop={topHeight}>
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
                  {...treeMenuRest}
                />
              </Sider>
            </Affix>
          )}
          <Content style={!leftMenuClose ? { marginLeft: 1 } : undefined}>
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
                  ...(mdAnchorLevel > 1 ? { marginInlineEnd: 142 } : undefined),
                },
              }}
            >
              {mdContent?.content ? (
                <MarkdownRender>{mdContent.content}</MarkdownRender>
              ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </Card>
            {mdAnchorLevel > 1 && <DocAnchor anchors={mdContentAnchors} />}
          </Content>
        </Layout>
      </SaContext.Provider>
    </PageContainer404>
  );
};

export default Markdown;
