import { PageContainer404 } from '@/components/Sadmin/404';
import { search2Obj, uid } from '@/components/Sadmin/helpers';
import { useSearchParams } from '@umijs/max';
import { Col, Row } from 'antd';
import type { Key } from 'react';
import { useState } from 'react';
import './style.less';
import type { saTableProps } from './table';
import SaTable from './table';
import TreeMenu from './treeMenu';

const PostsList: React.FC<saTableProps> = (props) => {
  const { tableTitle = false, path, leftMenu, setting } = props;
  const {
    name: categorysName = 'categorys',
    title: treeTitle = '分类选择',
    url_name: category_id_name = 'category_id',
    field,
    close: leftMenuClose = false,
    page = 0,
    ...treeMenuRest
  } = setting?.leftMenu || leftMenu || { close: true };

  const [categorys, setCategorys] = useState<any[]>([]);

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
  const onSelect = (keys: Key[]) => {
    const key = keys.length > 0 ? keys[keys.length - 1] : 0;
    setKey(key);
    const url_search_obj = search2Obj([category_id_name]);
    if (key) {
      url_search_obj[category_id_name] = key + '';
    }
    setUrlSearch({ ...url_search_obj });
  };
  const [reloadUid, setReloadUid] = useState<string>('');
  const [resetCategorys, setResetCategorys] = useState<boolean>(false);
  return (
    <PageContainer404 title={tableTitle} path={path}>
      <Row gutter={[30, 0]} style={!leftMenuClose && categorys.length > 1 ? { marginLeft: 0 } : {}}>
        {!leftMenuClose && categorys.length > 1 && (
          <Col span={3} style={{ paddingInline: 0 }}>
            <TreeMenu
              treeData={categorys}
              onSelect={onSelect}
              fieldNames={field}
              selectedKeys={[category_id]}
              title={treeTitle}
              page={page}
              onReload={() => {
                setResetCategorys(false);
                setReloadUid(uid());
              }}
              {...treeMenuRest}
            />
          </Col>
        )}
        <Col span={!leftMenuClose && categorys.length > 1 ? 21 : 24}>
          <SaTable
            {...props}
            initPageUid={reloadUid}
            paramExtra={
              category_id
                ? {
                    ...props.paramExtra,
                    [category_id_name]: category_id,
                    reloadUid,
                  }
                : { ...props.paramExtra, reloadUid }
            }
            beforeTableGet={(ret) => {
              // if (leftMenuClose) {
              //   return;
              // }

              if ((categorys.length > 1 && resetCategorys) || !ret.search?.[categorysName]) {
                return;
              }
              setResetCategorys(true);

              //开始左侧菜单才设置数据
              setCategorys([...ret.search[categorysName]]);
            }}
          />
        </Col>
      </Row>
    </PageContainer404>
  );
};

export default PostsList;
