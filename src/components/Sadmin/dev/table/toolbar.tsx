import { MenuFormColumn } from '@/pages/dev/menu';
import request, { currentUser, getFullUrl, requestHeaders } from '@/components/Sadmin/lib/request';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  CloudDownloadOutlined,
  CloudUploadOutlined,
  DeleteOutlined,
  EditOutlined,
  LoadingOutlined,
  PlusOutlined,
  SettingOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { FormattedMessage, Link, useModel } from '@umijs/max';
import { App, Button, Dropdown, Modal, Popover, Space, Tree, Upload } from 'antd';
import { cloneDeep, isString } from 'lodash';
import React, { useContext, useEffect, useState } from 'react';
import ButtonDrawer from '../../action/buttonDrawer';
import CustomerColumnRender from '../../action/customerColumn';
import { t, uid } from '../../helpers';
import { SaForm } from '../../posts/post';
import { SaContext } from '../../posts/table';
import { DndContext } from '../dnd-context';
import { getModelColumns } from './baseFormColumns';
import { ToolbarColumnTitle } from './title';
import { SaDevContext } from '..';
import { saReloadMenu } from '../../components/refresh';

export const ToolBarDom = (props) => {
  const {
    selectedRows,
    selectRowBtns = [],
    remove,
    switchState,
    deleteable = true,
    devEnable: pdevEnable,
  } = props;
  const { searchData } = useContext(SaContext);
  //console.log('props.btns', selectRowBtns);
  const selectedIds = selectedRows.map((item) => item.id);
  const { initialState } = useModel('@@initialState');
  const devEnable =
    pdevEnable && !initialState?.settings?.devDisable && initialState?.settings?.dev;
  return (
    <Space>
      <Space key="selectbar_count">
        <span>选择</span>
        <a style={{ fontWeight: 600 }}>{selectedRows.length}</a>
        <span>项</span>
      </Space>
      {searchData?.states?.map((stateButton, k) => {
        return (
          <Button
            key={'state_' + k}
            size="small"
            icon={!stateButton.value ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
            type={!stateButton.value ? 'dashed' : 'primary'}
            danger={!stateButton.value ? true : false}
            onClick={async () => {
              switchState(
                selectedIds,
                '确定要' + stateButton.label + ':' + selectedRows.length + '条记录吗？',
                stateButton.value,
              );
            }}
          >
            批量{stateButton.label}
          </Button>
        );
      })}

      {deleteable ? (
        <Button
          key="selectbar_delete"
          danger
          type="primary"
          size="small"
          icon={<DeleteOutlined />}
          onClick={async () => {
            remove(selectedIds, '确定要删除:' + selectedRows.length + '条记录吗？');
          }}
        >
          批量删除
        </Button>
      ) : null}

      {selectRowBtns?.map((cbtn, ci) => {
        return (
          <Space key="selectbar" key={'customer_' + ci}>
            {devEnable && (
              <Button size="small" key={cbtn.uid + '_dev'} type="dashed">
                <ToolbarColumnTitle {...cbtn} title={cbtn.title ? cbtn.title : '配置'} />
              </Button>
            )}
            <CustomerColumnRender
              key={'customer_' + ci}
              items={cbtn.fieldProps?.items}
              paramExtra={{ ids: selectedIds }}
              record={{ ids: selectedIds }}
            />
          </Space>
        );
      })}

      {devEnable && selectRowBtns.length < 1 && (
        <Button key="toolbar_add_dev" type="dashed" size="small">
          <ToolbarColumnTitle title="+" />
        </Button>
      )}
    </Space>
  );
};

const ExportButton = ({
  title = '导出',
  fieldProps = { post: {}, button: {} },
  values = {},
  url = '',
}) => {
  const { searchFormRef } = useContext(SaContext);
  const [modalApi, modalHolder] = Modal.useModal();
  const { post = {}, button = {} } = fieldProps;
  return (
    <>
      <Button
        key="exportButton"
        icon={<CloudDownloadOutlined />}
        onClick={async () => {
          modalApi.confirm({
            title: '温馨提示！',
            content: '确定要导出吗？',
            onOk: async () => {
              const search = searchFormRef?.current?.getFieldsFormatValue();
              await request.post(url + '/export', { data: { ...values, ...post, ...search } });
            },
          });
        }}
        {...button}
      >
        {title}
      </Button>
      {modalHolder}
    </>
  );
};

//导入按钮

const ImportButton = ({ title = '导入', url = '', uploadProps: ups = {}, afterAction }) => {
  const [headers, setHeaders] = useState();

  const uploadProps = {
    name: 'file',
    action: getFullUrl(url + '/import'),
    itemRender: () => '',
    ...ups,
  };
  const [loading, setLoading] = useState(false);
  const { messageApi } = useContext(SaDevContext);
  const { actionRef } = useContext(SaContext);
  useEffect(() => {
    requestHeaders().then((v) => {
      setHeaders(v);
    });
  }, []);
  return (
    <Upload
      key="importButton"
      {...uploadProps}
      headers={headers}
      onChange={(info) => {
        setLoading(true);
        if (info.file.status !== 'uploading') {
          //console.log(info.file, info.fileList);
        }
        if (info.file.status === 'done') {
          //console.log('donenenene');
          setLoading(false);
          const { code, msg, data } = info.file.response;
          if (!code) {
            //设置预览图片路径未服务器路径
            messageApi?.success(`${info.file.name} ${msg}`);
            if (afterAction) {
              afterAction?.(info.file.response).then((v) => {
                if (v != true) {
                  actionRef.current?.reload();
                }
              });
            } else {
              actionRef.current?.reload();
            }
          } else {
            //上传失败了
            messageApi?.error(msg);
          }
        } else if (info.file.status === 'error') {
          setLoading(false);
          messageApi?.error(`${info.file.name} file upload failed.`);
        }
      }}
    >
      <Button icon={loading ? <LoadingOutlined /> : <CloudUploadOutlined />}>{title}</Button>
    </Upload>
  );
};

export const ToolMenuForm = (props) => {
  const { setInitialState, initialState } = useModel('@@initialState');
  const { pageMenu = { id: 0 }, trigger } = props;
  const MenuForm = (mprops) => {
    const { contentRender, setOpen } = mprops;
    return (
      <SaForm
        formColumns={MenuFormColumn}
        url="dev/menu/show"
        dataId={pageMenu?.id}
        paramExtra={{ id: pageMenu?.id }}
        postExtra={{ id: pageMenu?.id }}
        showTabs={false}
        grid={false}
        devEnable={false}
        width={1600}
        msgcls={async ({ code, data }) => {
          if (!code) {
            saReloadMenu(initialState, setInitialState);
          }
          setOpen(false);
          return;
        }}
        formProps={{
          contentRender,
          submitter: {
            //移除默认的重置按钮，点击重置按钮后会重新请求一次request
            render: (props, doms) => {
              return [
                <Button key="rest" type="default" onClick={() => setOpen?.(false)}>
                  {t('cancel')}
                </Button>,
                doms[1],
              ];
            },
          },
        }}
      />
    );
  };
  return (
    <ButtonDrawer trigger={trigger} width={1600} title="菜单配置">
      <MenuForm />
    </ButtonDrawer>
  );
};

/**
 * 打开后显示当前菜单的form表单
 * @param props
 * @returns
 */
export const ToolBarMenu = (props) => {
  const { trigger, pageMenu = { id: 0 } } = props;

  return (
    <Dropdown
      trigger={['click']}
      menu={{
        items: [
          {
            key: 'edit',
            label: (
              <ToolMenuForm
                pageMenu={pageMenu}
                trigger={
                  <Button icon={<EditOutlined />} type="link">
                    编辑
                  </Button>
                }
              />
            ),
          },
          {
            key: 'export',
            label: (
              <ExportButton
                url="dev/menu"
                fieldProps={{ post: { ids: [pageMenu?.id] }, button: { type: 'link' } }}
              />
            ),
          },
        ],
      }}
    >
      <span
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        {trigger}
      </span>
    </Dropdown>
  );
};

export const ColumnsSelector = (props) => {
  const { trigger, dev } = props;
  const [treeData, setTreeData] = useState<any[]>();
  const [treeChecked, setTreeChecked] = useState<any[]>();
  const {
    tableDesigner: { pageMenu, reflush, editUrl = '', type = 'table' },
  } = useContext(SaContext);

  const getDataByType = (type: string) => {
    if (type == 'table') {
      return pageMenu?.data?.tableColumns;
    } else {
      //表单需要处理数据
      const cls: any[] = [];
      pageMenu?.data?.tabs?.forEach((tab: any) => {
        const formColumns = tab?.formColumns;
        formColumns?.forEach((group: any) => {
          const columns = group?.columns;
          columns?.forEach((cl: any) => {
            if (cl?.dataIndex) {
              cls.push({ dataIndex: cl?.dataIndex });
            }
          });
        });
      });
      return cls;
    }
  };

  useEffect(() => {
    const _treeData = getModelColumns(pageMenu?.model_id, dev);

    setTreeData(
      _treeData.map((v) => {
        return { label: v.label, value: v.value };
      }),
    );
    //初始化已有的列
    const defaultChecked = getDataByType(type)
      ?.map((v) => v.dataIndex)
      .filter((v) => isString(v));
    setTreeChecked(defaultChecked);
    //console.log('editUrl', editUrl, type);
  }, []);
  const post = async (e) => {
    const { data } = await request.post(editUrl, {
      data: {
        base: { id: pageMenu?.id, checked: e.checked, key: e.node.key, actionType: 'setColumns' },
      },
      then: () => {
        return;
      },
    });
    reflush(data);
  };
  const onCheck = async (keys, e) => {
    //将数据提交到后台
    setTreeChecked(keys);
    await post(e);
  };
  const content = (
    <Tree
      treeData={treeData}
      checkedKeys={treeChecked}
      onCheck={onCheck}
      fieldNames={{ title: 'label', key: 'value' }}
      checkable
      height={300}
    />
  );
  return (
    <Popover
      content={<div style={{ width: 250 }}>{content}</div>}
      title="快速选择"
      trigger={'click'}
      placement="bottom"
    >
      {trigger}
    </Popover>
  );
};

export const toolBarRender = (props) => {
  //导出按钮
  const {
    addable = true,
    openType = 'drawer',
    setCurrentRow,
    handleModalVisible,
    path,
    toolBarButton = [],
    url,
    paramExtra,
    enums,
    table_menu_key,
    tableMenuId,
    selectedRowKeys,
    devEnable: pdevEnable,
    pageMenu,
    sort,
    afterFormPost,
  } = props;
  const createButton = (
    <Button type="primary" key="primary">
      <Space>
        <PlusOutlined />
        <FormattedMessage id="pages.searchTable.new" />
      </Space>
    </Button>
  );
  const { initialState, setInitialState } = useModel('@@initialState');
  const devEnable =
    pdevEnable && !initialState?.settings?.devDisable && initialState?.settings?.dev;
  const values = { ...paramExtra, ids: selectedRowKeys, sort };
  if (table_menu_key) {
    values[table_menu_key] = tableMenuId;
  }

  const _btns = cloneDeep(toolBarButton);
  if (devEnable) {
    _btns.push({
      valueType: 'devcolumns',
      title: <UnorderedListOutlined />,
      key: 'devcolumns',
    });
    _btns.push({
      valueType: 'devsetting',
      title: <SettingOutlined />,
      key: 'devsetting',
    });
    if (_btns.length <= 2) {
      _btns.push({
        valueType: 'devadd',
        title: '+',
        key: 'devadd',
      });
    }
  }
  const render = () => {
    const btns = [];
    const defaultTitle = { export: '导出', import: '导入', toolbar: '配置' };
    _btns?.forEach((btn, index) => {
      //console.log('btn', btn);
      if (devEnable && (isString(btn.title) || !btn.title)) {
        btn.title = (
          <ToolbarColumnTitle
            {...btn}
            key={btn.key}
            title={btn.title ? btn.title : defaultTitle[btn.valueType]}
          />
        );
      }

      if (btn.valueType == 'export') {
        btns.push(<ExportButton key="export" {...btn} url={url} values={values} />);
      }
      if (btn.valueType == 'import') {
        btns.push(<ImportButton key="import" {...btn} url={url} afterAction={afterFormPost} />);
      }
      if (btn.valueType == 'devadd') {
        btns.push(
          <Button key={btn.key} type="dashed">
            {btn.title}
          </Button>,
        );
      }
      if (btn.valueType == 'devsetting') {
        btns.push(
          <ToolBarMenu
            key="devsetting"
            trigger={
              <Button type="dashed" danger>
                {btn.title}
              </Button>
            }
            pageMenu={pageMenu}
          />,
        );
      }
      if (btn.valueType == 'devcolumns') {
        btns.push(
          <ColumnsSelector
            key="devcolumns"
            trigger={
              <Button type="dashed" title="快速选择">
                {btn.title}
              </Button>
            }
            dev={initialState?.settings?.dev}
          />,
        );
      }
      if (btn.valueType == 'toolbar') {
        //console.log('toolbar btn', btn);
        if (devEnable) {
          //console.log('toolbar btn', btn);
          btns.push(
            <Button key={btn.uid + '_dev'} type="dashed">
              <ToolbarColumnTitle {...btn} />
            </Button>,
          );
        }
        btns.push(
          <CustomerColumnRender
            key={'ccrender_' + index}
            items={btn.fieldProps?.items}
            paramExtra={values}
            record={enums}
          />,
        );
      }
    });

    typeof props.toolBar == 'function' &&
      btns.push(React.cloneElement(props.toolBar({ enums }), { key: 'ctoolbar' }));
    if (addable) {
      if (openType == 'drawer' || openType == 'modal') {
        btns.push(
          React.cloneElement(createButton, {
            onClick: async (e: any) => {
              setCurrentRow({ id: 0 });
              handleModalVisible(true);
            },
          }),
        );
      } else {
        btns.push(
          <Link key="add" to={path ? path + '/0' : './0'}>
            {createButton}
          </Link>,
        );
      }
    }
    return [<DndContext key="toolbar">{btns}</DndContext>];
  };
  return render;
};
