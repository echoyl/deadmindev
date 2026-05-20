import { PageContainer404 } from '@/components/Sadmin/404';
import { search2Obj } from '@/components/Sadmin/helpers';
import { EditOutlined } from '@ant-design/icons';
import { useModel, useSearchParams } from '@umijs/max';
import type { GetProp } from 'antd';
import { Anchor, Button, Card, Col, Row, Space } from 'antd';
import type { Key } from 'react';
import React, { useEffect, useState } from 'react';
import ConfirmForm from '../action/confirmForm';
import DevSwitch from '../dev/switch';
import { ToolBarMenu } from '../dev/table/toolbar';
import { fullPageHeight, getFirstChild } from '../helper/functions';
import request from '../lib/request';
import { MarkdownRender } from '../valueTypeMap';
import './style.less';
import type { saTableProps } from './table';
import TreeMenu from './treeMenu';

/**
 * 获取 markdown 内容中的锚点信息
 * @param content markdown 内容
 * @param maxLevel 获取的最大层级
 * @returns
 */
const getAnchors = (content: string, maxLevel = 3) => {
  if (!content) return [];

  const headingRe = /^(\#{1,6})\s*(.+)$/gm;
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
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
    } else {
      base = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .trim()
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
  const { tableTitle = false, path, leftMenu, setting, url = '', pageMenu, openType } = props;
  const {
    title: treeTitle = '目录',
    url_name: category_id_name = 'id',
    field = { key: 'id', title: 'title', children: 'children' },
    close: leftMenuClose = false,
    span = 4,
    mdAnchorLevel = 3,
    ...treeMenuRest
  } = setting?.leftMenu || leftMenu || { close: true };
  const page = pageMenu?.id;
  const [categorys, setCategorys] = useState<any[]>([]);
  const { initialState } = useModel('@@initialState');
  //const setUrlSearch = useUrlSearchParams({}, { disabled: false })[1];
  const [searchParams, setUrlSearch] = useSearchParams();

  //console.log(searchParams, 333);
  const searchCategoryId = searchParams.get(category_id_name);
  const [category_id, setKey] = useState<Key>(
    searchCategoryId
      ? Number.isNaN(searchCategoryId)
        ? searchCategoryId
        : parseInt(searchCategoryId)
      : 0,
  );

  const [mdContent, setMdContent] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [mdContentAnchors, setMdContentAnchors] = useState<GetProp<typeof Anchor, 'items'>>([]); //markdown内容中的锚点信息

  //获取单个元素的内容信息
  const getMdContent = (menu: Record<string, any>) => {
    setLoading(true);
    const params = {
      id: menu.id,
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
      setMdContentAnchors(anchors[0]?.children || []); //一般一个页面只有一个h1，所以直接使用第一个元素的子元素作为锚点信息
    }
  }, [mdContent, mdAnchorLevel]);

  const onSelect = (keys: Key[]) => {
    if (!keys || !keys.length) {
      return;
    }
    const key = keys.length > 0 ? keys[keys.length - 1] : 0;
    setKey(key);
    const url_search_obj = search2Obj([category_id_name]);
    if (key) {
      url_search_obj[category_id_name] = key + '';
    }
    setUrlSearch({ ...url_search_obj });
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
    }
  };
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
  return (
    <PageContainer404 title={tableTitle} path={path}>
      <Row gutter={[30, 0]} style={!leftMenuClose ? { marginLeft: 0 } : {}}>
        {!leftMenuClose && (
          <Col span={span} style={{ paddingInline: 0 }}>
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
              {...treeMenuRest}
            />
          </Col>
        )}
        <Col span={!leftMenuClose ? 24 - span : 24}>
          <Card
            loading={loading}
            variant="borderless"
            title={mdContent?.title}
            extra={
              <Space>
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
                <ToolBarMenu key="devsetting" pageMenu={pageMenu} />
                <DevSwitch key="DevSwitch" type="button" />
              </Space>
            }
          >
            <div
              id="markdown-body"
              style={{ height: `calc(100vh - ${baseHeight + 56 + 48}px)`, overflowY: 'scroll' }}
            >
              <Row gutter={[16, 0]} style={mdAnchorLevel > 1 ? { margin: 0 } : {}}>
                <Col span={mdAnchorLevel > 1 ? 20 : 24}>
                  <MarkdownRender>{mdContent?.content}</MarkdownRender>
                </Col>
                {mdAnchorLevel > 1 && (
                  <Col span={4}>
                    <Anchor
                      items={mdContentAnchors}
                      getContainer={() => document.getElementById('markdown-body') as HTMLElement}
                    />
                  </Col>
                )}
              </Row>
            </div>
          </Card>
        </Col>
      </Row>
    </PageContainer404>
  );
};

export default Markdown;
