import { findParents, search2Obj } from '@/components/Sadmin/helpers';
//import { PageContainer } from '@ant-design/pro-layout';
import { useSearchParams } from '@umijs/max';
import { Col, Row, Splitter, Tree, Typography } from 'antd';
import Title from 'antd/lib/typography/Title';
import React, { useState } from 'react';
import './style.less';
import type { saTableProps } from './table';
import SaTable from './table';
import { PageContainer404 } from '@/components/Sadmin/404';

const PostsList: React.FC<saTableProps> = (props) => {
  const { tableTitle = false, path, leftMenu } = props;
  const {
    name: categorysName = 'categorys',
    title: treeTitle = '分类选择',
    url_name: category_id_name = 'category_id',
    field: treeFieldNams = { title: 'label', key: 'value', children: 'children' },
    close: leftMenuClose = false,
  } = leftMenu || { close: true };

  const [categorys, setCategorys] = useState([]);

  //const setUrlSearch = useUrlSearchParams({}, { disabled: false })[1];
  const [searchParams, setUrlSearch] = useSearchParams();

  //console.log(searchParams, 333);
  const searchCategoryId = searchParams.get(category_id_name);
  const [category_id, setKey] = useState(
    searchCategoryId
      ? isNaN(searchCategoryId)
        ? searchCategoryId
        : parseInt(searchCategoryId)
      : 0,
  );
  const [expandedKeys, setExpandedKeys] = useState([]);
  return (
    <PageContainer404 title={tableTitle} path={path}>
      <Row gutter={[30, 0]} style={categorys.length > 1 ? { marginLeft: 0 } : {}}>
        {categorys.length > 1 && (
          <Col span={3} title={treeTitle} style={{ background: '#fff',padding:10 }}>
            <Typography.Text strong> {treeTitle}</Typography.Text>
            <Tree
              selectedKeys={[category_id]}
              expandedKeys={expandedKeys}
              treeData={categorys}
              fieldNames={treeFieldNams}
              onSelect={(keys) => {
                let key = 0;
                if (keys.length > 0) {
                  key = keys.pop();
                }
                setKey(key);
                let url_search_obj = search2Obj([category_id_name]);
                if (key) {
                  url_search_obj[category_id_name] = key + '';
                }
                setUrlSearch({ ...url_search_obj });
              }}
              onExpand={(keys) => {
                setExpandedKeys(keys);
              }}
            />
          </Col>
        )}
        <Col span={categorys.length > 1 ? 21 : 24}>
          <SaTable
            {...props}
            paramExtra={
              category_id
                ? {
                    ...props.paramExtra,
                    [category_id_name]: category_id,
                  }
                : { ...props.paramExtra }
            }
            beforeTableGet={(ret) => {
              if (leftMenuClose) {
                return;
              }
              if (categorys.length > 0 || !ret.search?.[categorysName]) {
                return;
              }

              //开始左侧菜单才设置数据
              setCategorys([...ret.search[categorysName]]);

              //获取分类父级路径
              if (category_id && expandedKeys.length < 1) {
                const category_parent_keys = findParents(ret.search[categorysName], category_id, {
                  id: 'value',
                  children: 'children',
                });
                //console.log(category_parent_keys, 111);
                setExpandedKeys(category_parent_keys);
              }
            }}
          />
        </Col>
      </Row>
    </PageContainer404>
  );
};

export default PostsList;
