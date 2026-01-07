import request, {
  getFullUrl,
  messageLoadingKey,
  requestHeaders,
} from '@/components/Sadmin/lib/request';
import { MenuFormColumn } from '@/pages/dev/menu';
import { modelFormColumns } from '@/pages/dev/model';
import ModelRelation from '@/pages/dev/modelRelation';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  CloudDownloadOutlined,
  CloudUploadOutlined,
  DatabaseOutlined,
  DeleteOutlined,
  MenuOutlined,
  PartitionOutlined,
  PlusOutlined,
  ProfileOutlined,
  ReloadOutlined,
  SettingOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import type { ProFormInstance } from '@ant-design/pro-components';
import { FormattedMessage, Link, useModel } from '@umijs/max';
import { Button, Dropdown, Popover, Space, Tree, Upload } from 'antd';
import { isString } from 'es-toolkit';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { SaDevContext } from '..';
import ButtonDrawer from '../../action/buttonDrawer';
import ButtonModal from '../../action/buttonModal';
import CustomerColumnRender from '../../action/customerColumn';
import { isStr } from '../../checkers';
import { saReloadMenu, saReloadModel } from '../../components/refresh';
import type { RequestButtonProps } from '../../components/requestButton';
import RequestButton from '../../components/requestButton';
import { parseIcon, t } from '../../helpers';
import { DevJsonContext } from '../../jsonForm';
import { SaForm } from '../../posts/post';
import { SaContext } from '../../posts/table';
import { DndContext } from '../dnd-context';
import { fieldColumn } from '../vars/model/fieldColumns';
import { getModelColumns } from './baseFormColumns';
import { ToolbarColumnTitle } from './title';

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
  afterAction,
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
          const { code, msg } = info.file.response;
          if (!code) {
            messageApi?.success({
              content: `${info.file.name} ${msg}`,
              key: messageLoadingKey,
              duration: 1,
              onClose: () => {
                if (afterAction) {
                  afterAction?.(info.file.response).then((v) => {
                    if (v != true) {
                      actionRef.current?.reload();
                    }
                  });
                } else {
                  actionRef.current?.reload();
                }
              },
            });
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
      <RequestButton btn={{ icon, loading, text: title, ...btn }} {...restProps} />
    </Upload>
  );
};

export const ToolMenuForm = (props) => {
  const { setInitialState } = useModel('@@initialState');
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
        msgcls={async ({ code }) => {
          if (!code) {
            saReloadMenu({ setInitialState });
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
  const { pageMenu = { model_id: 0 }, trigger } = props;
  const ModelForm = (mprops) => {
    const { contentRender, setOpen } = mprops;
    const formRef = useRef<ProFormInstance<any>>({} as any);

    const { devData, setDevData } = useContext(SaDevContext);
    return (
      <SaForm
        formRef={formRef}
        formColumns={(detail) => {
          return modelFormColumns(detail, devData);
        }}
        url="dev/model/show"
        dataId={pageMenu?.model_id}
        paramExtra={{ id: pageMenu?.model_id }}
        postExtra={{ id: pageMenu?.model_id }}
        grid={true}
        devEnable={false}
        msgcls={({ code, data }) => {
          setOpen(false);
          if (!code) {
            saReloadModel({ devData, setDevData }, data);
          }
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

export const ToolModelFieldsForm = (props) => {
  const { pageMenu = { model_id: 0 }, trigger } = props;
  const ModelForm = (mprops) => {
    const { contentRender, setOpen } = mprops;
    const formRef = useRef<ProFormInstance<any>>({} as any);

    const { devData, setDevData } = useContext(SaDevContext);
    return (
      <SaForm
        formRef={formRef}
        tabs={[
          {
            tab: { title: '基本信息' },
            formColumns: [
              fieldColumn,
              {
                title: '提交后',
                dataIndex: 'afterPostOptions',
                valueType: 'checkbox',
                tooltip: '勾选后自动创建或更新数据库表，在变更字段时使用',
                fieldProps: {
                  options: [{ label: '生成表', value: 'createModelSchema' }],
                  defaultValue: ['createModelSchema'],
                },
              },
            ],
          },
        ]}
        url="dev/model/show"
        dataId={pageMenu?.model_id}
        paramExtra={{ id: pageMenu?.model_id }}
        postExtra={{ id: pageMenu?.model_id }}
        grid={true}
        devEnable={false}
        msgcls={({ code, data }) => {
          setOpen(false);
          if (!code) {
            saReloadModel({ devData, setDevData }, data);
          }
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
        pageType="drawer"
      />
    );
  };
  return (
    <ButtonDrawer
      trigger={trigger}
      width={1500}
      title="模型字段"
      drawerProps={{ styles: { body: { paddingTop: 8 } } }}
    >
      <ModelForm />
    </ButtonDrawer>
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
                  <Button type="link" icon={<MenuOutlined />}>
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
                      <Button type="link" icon={<DatabaseOutlined />}>
                        模型
                      </Button>
                    }
                  />
                ),
              }
            : null,
          pageMenu.model_id
            ? {
                key: 'editModelFields',
                label: (
                  <ToolModelFieldsForm
                    pageMenu={pageMenu}
                    trigger={
                      <Button type="link" icon={<ProfileOutlined />}>
                        字段
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
                      <Button type="link" icon={<PartitionOutlined />}>
                        关联
                      </Button>
                    }
                    width={1000}
                    title="关联"
                    //drawerProps={{ styles: { body: { padding: 16 } } }}
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
  const { trigger } = props;
  const { devData } = useContext(SaDevContext);
  const [treeData, setTreeData] = useState<any[]>();
  const [treeChecked, setTreeChecked] = useState<any[]>();
  const { tableDesigner: { pageMenu, reflush, editUrl = '', type = 'table' } = {} } =
    useContext(SaContext);

  const getDataByType = (_type: string) => {
    if (_type == 'table') {
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
    const _treeData = getModelColumns(pageMenu?.model_id, devData);

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
  }, [devData?.allModels]);
  const post = async (e) => {
    const { data } = await request.post(editUrl, {
      data: {
        base: { id: pageMenu?.id, checked: e.checked, key: e.node.key, actionType: 'setColumns' },
      },
      then: () => {
        return;
      },
    });
    reflush?.(data);
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
        const btnTitle = btn.title ? btn.title : defaultTitle[btn.valueType];
        //按钮如果是导入因为有upload的高度 不需要额外添加padding
        btn.title = (
          <ToolbarColumnTitle
            {...btn}
            key={btn.key}
            title={
              btn.valueType == 'import' ? (
                btnTitle
              ) : (
                <div style={{ padding: '4px 0' }}>{btnTitle}</div>
              )
            }
          />
        );
      }

      if (btn.valueType == 'export') {
        btns.push(<ExportButton key={index} {...btn} request={{ data: values }} />);
      }
      if (btn.valueType == 'import') {
        btns.push(
          <ImportButton
            key={index}
            {...btn}
            request={{ data: values }}
            afterAction={afterFormPost}
          />,
        );
      }

      if (btn.valueType == 'devsetting') {
        btns.push(
          <ToolBarMenu key={index} trigger={<Button icon={btn.icon} />} pageMenu={pageMenu} />,
        );
      }
      if (btn.valueType == 'devcolumns') {
        btns.push(
          <ColumnsSelector key={index} trigger={<Button title="快速选择" icon={btn.icon} />} />,
        );
      }
      if (btn.valueType == 'toolbar') {
        //console.log('toolbar btn', btn);
        if (devEnable) {
          btns.push(
            <Button key={btn.uid + '_dev'} type="dashed">
              {btn.title}
            </Button>,
          );
        }
        //这里如果后台没有传入enums的话 dom会返回空
        //console.log('CustomerColumnRender', values);
        btns.push(
          <CustomerColumnRender
            key={'ccrender_' + index}
            items={btn.fieldProps?.items}
            paramExtra={values}
            record={{ ...enums, type: 'toolbar' }}
          />,
        );
      }
      if (btn.valueType == 'devadd' && toolBarButton.length < 1) {
        btns.push(
          <Button key={btn.key} type="dashed">
            {btn.title}
          </Button>,
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
