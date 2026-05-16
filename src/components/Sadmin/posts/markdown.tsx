import { PageContainer404 } from '@/components/Sadmin/404';
import { search2Obj } from '@/components/Sadmin/helpers';
import { EditOutlined } from '@ant-design/icons';
import { useModel, useSearchParams } from '@umijs/max';
import { Button, Card, Col, Row, Space } from 'antd';
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

const Markdown: React.FC<saTableProps> = (props) => {
  const { tableTitle = false, path, leftMenu, setting, url = '', pageMenu, openType } = props;
  const {
    title: treeTitle = '目录',
    url_name: category_id_name = 'id',
    field = { key: 'id', title: 'title', children: 'children' },
    close: leftMenuClose = false,
    span = 4,
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
            styles={{ body: { height: `calc(100vh - ${baseHeight + 56}px)`, overflowY: 'scroll' } }}
          >
            <MarkdownRender>{mdContent?.content}</MarkdownRender>
          </Card>
        </Col>
      </Row>
    </PageContainer404>
  );
};

export default Markdown;
