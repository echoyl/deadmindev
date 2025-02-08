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
  ReloadOutlined,
  SettingOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { FormattedMessage, Link, useModel } from '@umijs/max';
import { App, Button, Dropdown, Modal, Popover, Space, Tooltip, Tree, Upload } from 'antd';
import { cloneDeep, isString } from 'lodash';
import React, { useContext, useEffect, useRef, useState } from 'react';
import ButtonDrawer from '../../action/buttonDrawer';
import CustomerColumnRender from '../../action/customerColumn';
import { parseIcon, t, tplComplie, uid } from '../../helpers';
import { SaForm } from '../../posts/post';
import { SaContext } from '../../posts/table';
import { DndContext } from '../dnd-context';
import { getModelColumns } from './baseFormColumns';
import { ToolbarColumnTitle } from './title';
import { SaDevContext } from '..';
import { saReload, saReloadMenu } from '../../components/refresh';
import ButtonModal from '../../action/buttonModal';
import { isStr, isUndefined } from '../../checkers';
import { modelFormColumns } from '@/pages/dev/model';
import { ProFormInstance } from '@ant-design/pro-components';
import ModelRelation from '@/pages/dev/modelRelation';
import RequestButton, { RequestButtonProps } from '../../components/requestButton';
import { DevJsonContext } from '../../jsonForm';

export const ToolBarDom = (props) => {
  const {
    selectedIds,
    selectRowBtns = [],
    remove,
    switchState,
    deleteable = true,
    devEnable: pdevEnable,
  } = props;
  const { searchData } = useContext(SaContext);
  //console.log('props.btns', selectRowBtns);
  //const selectedIds = selectedRows.map((item) => item.id);
  const { initialState } = useModel('@@initialState');
  const devEnable =
    pdevEnable && !initialState?.settings?.devDisable && initialState?.settings?.adminSetting?.dev;
  return (
    <Space>
      <Space key="selectbar_count">
        <span>选择</span>
        <a style={{ fontWeight: 600 }}>{selectedIds.length}</a>
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
                '确定要' + stateButton.label + ':' + selectedIds.length + '条记录吗？',
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
            remove(selectedIds, '确定要删除:' + selectedIds.length + '条记录吗？');
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

export const ExportButton = ({
  title = '导出',
  request: requestParam,
  requestUrl = '', //新增手动设定导出
  btn = {},
  fieldProps = {},
  ...restProps
}: RequestButtonProps) => {
  const { url = '', data = {} } = requestParam || {};
  const { searchFormRef, url: propsUrl } = useContext(SaContext);
  const { modalApi } = useContext(SaDevContext);
  const purl = requestUrl ? requestUrl : url ? url : propsUrl + '/export';
  const { post = {} } = fieldProps; //导出按钮自定义请求传输数据
  const onClick = async () => {
    modalApi?.confirm({
      title: '温馨提示！',
      content: '确定要导出吗？',
      onOk: async () => {
        const search = searchFormRef?.current?.getFieldsFormatValue();
        await request.post(purl, { data: { ...data, ...search, ...post } });
      },
    });
  };
  return (
    <RequestButton
      btn={{ icon: <CloudDownloadOutlined />, onClick, text: title, ...btn }}
      {...restProps}
    />
  );
};

//导入按钮

export const ImportButton = ({
  title = '导入',
  request: requestParam,
  uploadProps: ups = {},
  afterAction = false,
  btn = {},
  ...restProps
}: RequestButtonProps) => {
  const [headers, setHeaders] = useState();
  const { url: propsUrl } = useContext(SaContext);
  const { url = '', data: rdata } = requestParam || {};
  const { data } = ups;
  const upData = data || rdata;
  const uploadProps = {
    name: 'file',
    action: getFullUrl(url ? url : propsUrl + '/import'),
    itemRender: () => '',
    ...ups,
    data: upData,
  };
  const [loading, setLoading] = useState(false);
  const { messageApi } = useContext(SaDevContext);
  const { actionRef } = useContext(SaContext);
  useEffect(() => {
    requestHeaders().then((v) => {
      setHeaders(v);
    });
  }, []);
  const icon = btn?.icon ? parseIcon(btn?.icon) : <CloudUploadOutlined />;
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
      <RequestButton
        btn={{ icon: <CloudDownloadOutlined />, loading, text: title, ...btn }}
        {...restProps}
      />
    </Upload>
  );
};

export const ToolMenuForm = (props) => {
  const { setInitialState, initialState } = useModel('@@initialState');
  const { json = {} } = useContext(DevJsonContext);
  const { pageMenu = { id: 0 }, trigger } = props;
  const MenuForm = (mprops) => {
    const { contentRender, setOpen } = mprops;
    return (
      <SaForm
        tabs={MenuFormColumn}
        url="dev/menu/show"
        dataId={pageMenu?.id}
        paramExtra={{ id: pageMenu?.id }}
        postExtra={{ id: pageMenu?.id }}
        grid={true}
        devEnable={false}
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
          initialValues: Object.keys(pageMenu).length > 0 ? false : json?.config,
        }}
      />
    );
  };
  return (
    <ButtonModal trigger={trigger} width={860} title="菜单配置">
      <MenuForm />
    </ButtonModal>
  );
};

export const ToolModelForm = (props) => {
  const { setInitialState, initialState } = useModel('@@initialState');
  const { pageMenu = { model_id: 0 }, trigger } = props;
  const ModelForm = (mprops) => {
    const { contentRender, setOpen } = mprops;
    const formRef = useRef<ProFormInstance<any>>({} as any);

    const { setting, setSetting } = useContext(SaDevContext);
    return (
      <SaForm
        formRef={formRef}
        formColumns={(detail) => {
          return modelFormColumns(detail, formRef, setting?.adminSetting);
        }}
        url="dev/model/show"
        dataId={pageMenu?.model_id}
        paramExtra={{ id: pageMenu?.model_id }}
        postExtra={{ id: pageMenu?.model_id }}
        grid={true}
        devEnable={false}
        msgcls={async ({ code, data }) => {
          if (!code) {
            saReload(initialState, setInitialState, setSetting);
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
    <ButtonModal trigger={trigger} width={860} title="模型配置">
      <ModelForm />
    </ButtonModal>
  );
};

/**
 * 打开后显示当前菜单的form表单
 * @param props
 * @returns
 */
export const ToolBarMenu = (props) => {
  const { trigger, pageMenu = { id: 0, model_id: 0 } } = props;
  // console.log('pageMenu', pageMenu);
  return (
    <Dropdown
      trigger={['click']}
      menu={{
        items: [
          {
            key: 'editMenu',
            label: (
              <ToolMenuForm
                pageMenu={pageMenu}
                trigger={
                  <Button type="link" icon={<EditOutlined />}>
                    菜单
                  </Button>
                }
              />
            ),
          },
          pageMenu.model_id
            ? {
                key: 'editModel',
                label: (
                  <ToolModelForm
                    pageMenu={pageMenu}
                    trigger={
                      <Button type="link" icon={<EditOutlined />}>
                        模型
                      </Button>
                    }
                  />
                ),
              }
            : null,
          pageMenu.model_id
            ? {
                key: 'editModelRelation',
                label: (
                  <ButtonDrawer
                    trigger={
                      <Button type="link" icon={<EditOutlined />}>
                        关联
                      </Button>
                    }
                    width={1000}
                    title="关联"
                  >
                    <ModelRelation model={{ id: pageMenu.model_id }} />
                  </ButtonDrawer>
                ),
              }
            : null,
          {
            key: 'export',
            label: (
              <ExportButton
                request={{ data: { ids: [pageMenu?.id] }, url: 'dev/menu/export' }}
                btn={{ type: 'link' }}
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
          if (isStr(group)) {
            cls.push({ dataIndex: group });
          } else {
            const columns = group?.columns;
            if (!isStr(columns)) {
              columns?.forEach((cl: any) => {
                if (cl?.dataIndex) {
                  cls.push({ dataIndex: cl?.dataIndex });
                }
              });
            }
          }
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
      .filter((v) => {
        return isString(v) && _treeData.findIndex((tv) => tv.value == v) >= 0;
      });
    setTreeChecked(defaultChecked);
    //console.log('editUrl', editUrl, type);
  }, [dev.allModels]);
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
    initRequest,
    initialState,
    table_menu_key,
    tableMenuId,
    selectedRowKeys,
    devEnable: pdevEnable,
    pageMenu,
    sort,
    afterFormPost,
    actionRef,
    setting,
  } = props;
  if (!initRequest) return null;
  const createButton = (
    <Button type="primary" key="primary">
      <Space>
        <PlusOutlined />
        <FormattedMessage id="pages.searchTable.new" />
      </Space>
    </Button>
  );
  const devEnable =
    pdevEnable && !initialState?.settings?.devDisable && initialState?.settings?.adminSetting?.dev;
  const values = { ...paramExtra, ids: selectedRowKeys, sort };
  if (table_menu_key) {
    values[table_menu_key] = tableMenuId;
  }

  //const _btns = cloneDeep(toolBarButton);
  const _btns: any[] = [];
  if (devEnable) {
    _btns.push({
      valueType: 'devcolumns',
      icon: <UnorderedListOutlined />,
      key: 'devcolumns',
    });
    _btns.push({
      valueType: 'devsetting',
      icon: <SettingOutlined />,
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
    [...toolBarButton, ..._btns]?.forEach((btn, index) => {
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
        btns.push(<ExportButton key={index} {...btn} request={{ data: values }} />);
      }
      if (btn.valueType == 'import') {
        btns.push(<ImportButton key={index} {...btn} afterAction={afterFormPost} />);
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
          <ToolBarMenu key={index} trigger={<Button icon={btn.icon} />} pageMenu={pageMenu} />,
        );
      }
      if (btn.valueType == 'devcolumns') {
        btns.push(
          <ColumnsSelector
            key={index}
            trigger={<Button title="快速选择" icon={btn.icon} />}
            dev={initialState?.settings?.adminSetting?.dev}
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
        //这里如果后台没有传入enums的话 dom会返回空
        btns.push(
          <CustomerColumnRender
            key={'ccrender_' + index}
            items={btn.fieldProps?.items}
            paramExtra={values}
            record={{ ...enums, type: 'toolbar' }}
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
    if (setting?.showType == 'card') {
      //卡片模式需要手动添加刷新按钮
      btns.push(
        <Button
          icon={<ReloadOutlined />}
          onClick={() => {
            actionRef?.current?.reload();
            return;
          }}
          type="text"
          key="card_reload"
        />,
      );
    }
    return [<DndContext key="toolbar">{btns}</DndContext>];
  };
  return render;
};
