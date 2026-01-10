/* eslint-disable react-hooks/exhaustive-deps */
import { CloseOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useModel } from '@umijs/max';
import type { GetProp, TreeProps } from 'antd';
import { Button, Card, Dropdown, Space, Tooltip, Tree } from 'antd';
import type { FC, Key, ReactNode } from 'react';
import { useEffect, useState } from 'react';
import Confirm from '../action/confirm';
import ConfirmForm from '../action/confirmForm';
import { findParents, getMenuDataById, t } from '../helpers';

type TreeMenuProps = {
  title?: string;
  page?: number;
  treeData?: GetProp<TreeProps, 'treeData'>;
  fieldNames?: GetProp<TreeProps, 'fieldNames'>;
  selectedKeys?: GetProp<TreeProps, 'selectedKeys'>;
  onSelect?: (keys: Key[]) => void;
  onReload?: () => void;
  defaultExpandAll?: boolean;
  showLine?: boolean;
};

const DeleteColumn: FC<{
  children?: ReactNode;
  url?: string;
  id?: Key;
  title?: ReactNode;
  callback?: () => void;
}> = (props) => {
  const { url, id, children, title = '', callback } = props;
  return (
    <Confirm
      trigger={children}
      method="delete"
      url={url}
      dataId={id}
      callback={callback}
      msg={
        <Space>
          确定要删除
          <span style={{ color: 'red' }} key="title">
            {title}
          </span>
          吗？
        </Space>
      }
    />
  );
};

const TreeMenu: FC<TreeMenuProps> = (props) => {
  const {
    title,
    page = 0,
    treeData = [],
    fieldNames = {},
    selectedKeys,
    onSelect,
    onReload,
    defaultExpandAll = true,
    showLine = true,
  } = props;
  const [formOpen, setFormOpen] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<Key[]>([]);
  const [dataId, setDataId] = useState<Key>(0);
  const [postData, setPostData] = useState<Record<string, any>>({});
  const { initialState } = useModel('@@initialState');
  const pageMenu = getMenuDataById(initialState?.currentUser?.menuData, page);
  const level = pageMenu?.data?.level || 0;
  const ftitle = fieldNames.title || 'label';
  const fkey = fieldNames.key || 'value';
  const children = fieldNames.children || 'children';
  const otherProps = defaultExpandAll
    ? { defaultExpandAll }
    : {
        expandedKeys,
        onExpand: (keys: Key[]) => {
          setExpandedKeys(keys);
        },
      };
  useEffect(() => {
    if (!defaultExpandAll && selectedKeys && selectedKeys[0] && expandedKeys.length < 1) {
      const category_parent_keys = findParents(treeData, selectedKeys[0], {
        id: fkey,
        children,
      });
      setExpandedKeys(category_parent_keys);
    }
  }, [selectedKeys]);
  const render = (sdata: any[], t_level: number = 0) => {
    //console.log(sdata);
    sdata.forEach((item) => {
      item._level = t_level;
      if (item[children]) {
        render(item[children], t_level + 1);
      }
    });
  };
  useEffect(() => {
    render(treeData);
  }, [treeData, fieldNames]);
  return (
    <Card
      title={title}
      variant="borderless"
      styles={{ root: { height: '100%' } }}
      extra={
        <Space>
          {selectedKeys && selectedKeys[0] ? (
            <Tooltip title="重置">
              <Button
                color="default"
                variant="link"
                size="small"
                icon={<CloseOutlined />}
                onClick={() => {
                  ///onReload?.();
                  onSelect?.([0]);
                }}
              />
            </Tooltip>
          ) : null}
          {page ? (
            <Button
              color="default"
              variant="link"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => {
                setFormOpen(true);
                setDataId(0);
              }}
            />
          ) : null}
        </Space>
      }
    >
      {/* <Typography.Text strong> {treeTitle}</Typography.Text> */}
      <ConfirmForm
        page={page}
        trigger={<></>}
        open={formOpen}
        onOpen={(open) => setFormOpen(open)}
        dataId={dataId}
        data={postData}
        callback={() => {
          //修改或添加成功后需要刷新页面中的数据
          onReload?.();
          return true;
        }}
      />
      <Tree
        selectedKeys={selectedKeys}
        {...otherProps}
        showLine={showLine}
        treeData={treeData}
        fieldNames={{ title: ftitle, key: fkey, children }}
        titleRender={(nodeData: Record<string, any>) => {
          const nodeTitle = nodeData[ftitle];
          const nodeKey = nodeData[fkey];
          const _level = nodeData._level ?? 0;
          return page ? (
            <Dropdown
              trigger={['contextMenu']}
              menu={{
                items: [
                  {
                    key: 'edit',
                    label: (
                      <Space>
                        <EditOutlined />
                        <span>{t('edit')}</span>
                      </Space>
                    ),
                  },
                  level - 1 > _level
                    ? {
                        key: 'add',
                        label: (
                          <Space>
                            <PlusOutlined />
                            <span>{t('addchild')}</span>
                          </Space>
                        ),
                      }
                    : null,
                  {
                    type: 'divider',
                  },
                  {
                    key: 'delete',
                    label: (
                      <DeleteColumn
                        id={nodeKey}
                        title={nodeTitle}
                        url={pageMenu?.data?.url + '/1'}
                        callback={() => {
                          onReload?.();
                          return true;
                        }}
                      >
                        <Space>
                          <DeleteOutlined />
                          <span>{t('delete')}</span>
                        </Space>
                      </DeleteColumn>
                    ),
                    danger: true,
                  },
                ],
                onClick: ({ key, domEvent }) => {
                  if (key === 'edit') {
                    setDataId(nodeKey);
                    setFormOpen(true);
                  } else if (key == 'add') {
                    setDataId(0);
                    setPostData({ parent_id: nodeKey });
                    setFormOpen(true);
                  } else if (key === 'delete') {
                  }

                  domEvent.stopPropagation();
                },
              }}
            >
              {nodeTitle}
            </Dropdown>
          ) : (
            nodeTitle
          );
        }}
        onSelect={(keys) => {
          onSelect?.(keys);
        }}
      />
    </Card>
  );
};
export default TreeMenu;
