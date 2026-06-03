/* eslint-disable react-hooks/exhaustive-deps */
import { CloseOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useModel } from '@umijs/max';
import type { GetProp, TreeProps } from 'antd';
import { Button, Card, Dropdown, Empty, Space, Tooltip, Tree } from 'antd';
import type { FC, Key, ReactNode } from 'react';
import { useEffect, useState } from 'react';
import Confirm from '../action/confirm';
import ConfirmForm from '../action/confirmForm';
import { fullPageHeight } from '../helper/functions';
import { findParents, getMenuDataById, t } from '../helpers';

type TreeMenuProps = {
  title?: string;
  page?: number;
  treeData?: GetProp<TreeProps, 'treeData'>;
  fieldNames?: GetProp<TreeProps, 'fieldNames'>;
  selectedKeys?: GetProp<TreeProps, 'selectedKeys'>;
  onSelect?: (keys: Key[], info?: any) => void;
  onReload?: (data: any, type?: string) => void;
  defaultExpandAll?: boolean;
  showLine?: boolean;
  showType?: 'modal' | 'drawer';
  onlyChildCanBeSelected?: boolean; //是否只有子元素可以被选中
  showClearSelected?: boolean; //是否显示清除选中
  maxLevel?: number; //最大层级
  editable?: boolean; //是否可编辑
  addable?: boolean; //是否可以新增
  deleteable?: boolean; //是否可以删除
  bodyHeight?: number | string; //可滚动的body高度
};

const DeleteColumn: FC<{
  children?: ReactNode;
  url?: string;
  id?: Key;
  title?: ReactNode;
  callback?: (data?: any) => void;
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
    showType,
    onlyChildCanBeSelected = false,
    showClearSelected = true,
    maxLevel = 0,
    editable = true, //是否可编辑
    addable = true, //是否可以新增
    deleteable = true, //是否可以删除
    bodyHeight, //可滚动的body高度
  } = props;
  const [formOpen, setFormOpen] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<Key[]>([]);
  const [dataId, setDataId] = useState<Key>(0);
  const [postData, setPostData] = useState<Record<string, any>>({});
  const { initialState } = useModel('@@initialState');
  const pageMenu = getMenuDataById(initialState?.currentUser?.menuData, page);
  const level = maxLevel || pageMenu?.data?.level || 0;
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
        if (onlyChildCanBeSelected) {
          item.selectable = false;
        }
        render(item[children], t_level + 1);
      }
    });
  };
  useEffect(() => {
    render(treeData);
  }, [treeData, fieldNames]);
  const fullHeight = fullPageHeight(initialState?.settings) + 56;
  const height = bodyHeight || `calc(100vh - ${fullHeight}px)`;
  return (
    <Card
      title={title}
      variant="borderless"
      styles={{
        body: {
          height,
          overflowY: 'auto',
        },
      }}
      extra={
        <Space>
          {selectedKeys && selectedKeys[0] && showClearSelected ? (
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
          {page && addable ? (
            <Button
              color="default"
              variant="link"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => {
                setFormOpen(true);
                setPostData({ parent_id: 0 });
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
        callback={({ code, data }) => {
          //修改或添加成功后需要刷新页面中的数据
          if (!code) {
            onReload?.(data, 'edit');
          }
          return true;
        }}
        showType={showType}
      />
      {treeData.length > 0 ? (
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
                    editable
                      ? {
                          key: 'edit',
                          label: (
                            <Space>
                              <EditOutlined />
                              <span>{t('edit')}</span>
                            </Space>
                          ),
                        }
                      : null,
                    level - 1 > _level && addable
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
                    (editable || (level - 1 > _level && addable)) && deleteable
                      ? {
                          type: 'divider',
                        }
                      : null,
                    deleteable
                      ? {
                          key: 'delete',
                          label: (
                            <DeleteColumn
                              id={nodeKey}
                              title={nodeTitle}
                              url={pageMenu?.data?.url + '/1'}
                              callback={({ code }) => {
                                if (!code) {
                                  onReload?.({ id: nodeKey }, 'delete');
                                }
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
                        }
                      : null,
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
          onSelect={(keys, info) => {
            onSelect?.(keys, info);
          }}
        />
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </Card>
  );
};
export default TreeMenu;
