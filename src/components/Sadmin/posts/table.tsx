import request from '@/components/Sadmin/lib/request';
import type {
  ActionType,
  ProFormInstance,
  ProFormProps,
  ProTableProps,
} from '@ant-design/pro-components';
import { FooterToolbar, ProTable } from '@ant-design/pro-components';
import { history, useModel, useSearchParams } from '@umijs/max';
import { Modal } from 'antd';
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { inArray, isArr, isFn, isObj, isStr, isUndefined } from '../checkers';
import { TableForm } from '../dev/table/form';
import TableIndex from '../dev/table/tableIndex';
import { ToolBarDom, toolBarRender } from '../dev/table/toolbar';
//import _ from 'underscore';
import { css } from '@emotion/css';
import { default as cls } from 'classnames';
import { DndContext } from '../dev/dnd-context';
import { tableDesignerInstance, useTableDesigner } from '../dev/table/designer';
import {
  getFromObject,
  isJsonString,
  saFormColumnsType,
  saFormTabColumnsType,
  saTableColumnsType,
  search2Obj,
  t,
} from '../helpers';
import { EditableCell, EditableRow } from './editable';
import './style.less';
import { getTableColumns } from './tableColumns';
import { SaDevContext } from '../dev';
export interface saTableProps {
  url?: string;
  name?: string;
  level?: number;
  tableColumns?: saTableColumnsType | ((value: any) => saTableColumnsType);
  formColumns?: saFormColumnsType | ((value: any) => saFormColumnsType);
  toolBar?: (value: any) => void;
  openType?: 'page' | 'drawer' | 'modal';
  openWidth?: number;
  tableTitle?: string | boolean;
  formTitle?: string | boolean;
  labels?: Record<string, any>;
  beforePost?: (value: any) => void | boolean;
  beforeGet?: (value: any) => void;
  beforeTableGet?: (value: any) => void;
  tableProps?: ProTableProps;
  tabs?: saFormTabColumnsType;
  /**
   * 删除操作时 弹出提示数据所展示的字段
   */
  titleField?: string | Array<string>;
  formProps?: ProFormProps;
  //左侧分类菜单的 配置信息
  leftMenu?: { name?: string; url_name?: string; field?: Object; title?: string };
  categorysName?: string;
  //table组件 toolbar中menu 请求和url中参数name
  table_menu_key?: string; //列表头部tab切换读取的数据字段名称
  table_menu_all?: boolean; //tab 是否需要自动加入全部选项
  table_menu_default?: string; //默认的tab值
  //actionRef 实例
  actionRef?: Object;
  //表单实例
  formRef?: ProFormInstance;
  pageType?: 'page' | 'drawer'; //table页面是page还是在弹出层中
  rowOnSelected?: any; //当列表checkbox被点击时触发事件
  paramExtra?: { [key: string]: any }; //后台其它设置中添加的请求额外参数，table request的时候会带上这些参数
  postExtra?: { [key: string]: any }; //表单提交时 额外传输的数据 不放在base中
  addable?: boolean; //是否可以新建 控制显示新建按钮
  editable?: boolean; //form打开后没有底部提交按钮
  deleteable?: boolean; //table中是否可以删除数据
  path?: string; //当前页面的路径
  checkEnable?: boolean; //数据是否可以check
  toolBarButton?: Array<{ title?: string; valueType?: string; [key: string]: any }>; //操作栏按钮设置
  selectRowRender?: (rowdom: any) => void | boolean;
  selectRowBtns?: Array<{ [key: string]: any }>;
  pageMenu?: { [key: string]: any }; //当前菜单信息
  devEnable?: boolean; //是否开启开发模式
  setting?: { [key: string]: any }; //其它配置统一放这里
  afterDelete?: (ret: any) => void; //删除数据后的回调
}

const components = {
  body: {
    row: EditableRow,
    cell: EditableCell,
  },
  header: {
    wrapper: (props) => {
      return (
        <DndContext>
          <thead {...props} />
        </DndContext>
      );
    },
    cell: (props) => {
      return (
        <th
          {...props}
          className={cls(
            props.className,
            css`
              max-width: 300px;
              white-space: nowrap;
              &:hover .general-schema-designer {
                display: block;
              }
            `,
          )}
        />
      );
    },
  },
};

interface saTableContextProps {
  edit: (...record: Array<{ [key: string]: any }>) => void;
  view: (id: any) => void;
  delete: (id: any) => void;
}
export const SaContext = createContext<{
  actionRef?: any;
  formRef?: any;
  columnData?: { [key: string]: any };
  searchData?: { [key: string]: any };
  url?: string;
  tableDesigner?: tableDesignerInstance;
  saTableContext?: saTableContextProps;
  searchFormRef?: any;
}>({});

const SaTable: React.FC<saTableProps> = (props) => {
  const {
    url = '',
    level = 1,
    tableColumns,
    openType = 'page',
    labels = {},
    beforeTableGet,
    titleField = 'title',
    table_menu_key,
    table_menu_all = true,
    table_menu_default = '',
    pageType = 'page',
    paramExtra = {},
    editable = true,
    deleteable = true,
    path,
    checkEnable = true,
    actionRef = useRef<ActionType>(),
    tableTitle = '列表',
    selectRowRender,
    selectRowBtns = [],
    formRef = useRef<ProFormInstance>(),
    tableProps = {
      size: 'middle',
    },
    pageMenu,
    devEnable: pdevEnable = true,
    setting = {},
    afterDelete,
  } = props;
  //console.log('tableprops', props);
  const [tbColumns, setTbColumns] = useState([]);
  const [enums, setEnums] = useState({ categorys: [] });
  const [summary, setSummary] = useState();
  const [columnData, setColumnData] = useState({});
  const [data, setData] = useState([]);
  const [initRequest, setInitRequest] = useState(false);
  //const url = 'posts/posts';
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  //记录当前的排序规则
  const [sort, setSort] = useState({});

  //const actionRef = props.actionRef ? props.actionRef : useRef<ActionType>();
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);

  const searchFormRef = useRef<ProFormInstance>();
  const [currentRow, setCurrentRow] = useState({});

  const [searchParams, setUrlSearch] = useSearchParams();

  const [tableMenu, setTableMenu] = useState<[{ [key: string]: any }]>();
  const searchTableMenuId =
    table_menu_key && pageType == 'page' ? searchParams.get(table_menu_key) : '';
  //console.log('searchTableMenuId', searchTableMenuId, searchParams.get(table_menu_key));
  const [tableMenuId, setTableMenuId] = useState<string>(
    searchTableMenuId ? searchTableMenuId : table_menu_default,
  );
  const _tableColumns = tableColumns
    ? isFn(tableColumns)
      ? tableColumns([])
      : [...tableColumns]
    : [];
  const enumNames = _tableColumns?.filter((v) => v.valueEnum).map((v) => v.dataIndex);
  const search_config = _tableColumns?.filter(
    (v) => isObj(v) && (isUndefined(v.search) || v.search),
  );

  const { initialState } = useModel('@@initialState');
  const [devEnable, setDevEnable] = useState(
    pdevEnable && !initialState?.settings?.devDisable && initialState?.settings?.dev,
  );
  // const [enumNames, setEnumNames] = useState<any[]>([]);
  // const [search_config, setSearch_config] = useState<any[]>([]);
  const rq = async (params = {}, sort: any, filter: any) => {
    if (!url) {
      return [];
    }
    for (let i in params) {
      if (typeof params[i] == 'object') {
        params[i] = JSON.stringify(params[i]);
      }
    }
    setSort(sort);
    const ret = await request.get(url, { params: { ...params, sort, filter } });
    if (!ret) {
      return;
    }
    //console.log('request to', url, params);
    if (beforeTableGet) {
      //console.log('beforeTableGet');
      beforeTableGet(ret);
    }
    //data = ret.data;
    if (ret.search.summary) {
      setSummary(ret.search.summary);
    }
    if (!initRequest) {
      setEnums({ ...ret.search });
      //设置查询form的初始值
      if (ret.search.values) {
        searchFormRef.current?.setFieldsValue(ret.search.values);
      }

      setColumnData({ ...ret.search }); //做成context 换一个名字
    }

    //log('setEnums', ret.search);
    //获取分类父级路径

    !initRequest && setInitRequest(true);
    if (ret.search?.table_menu && !initRequest && table_menu_key) {
      if (table_menu_all) {
        setTableMenu([{ label: t('all'), value: 'all' }, ...ret.search.table_menu[table_menu_key]]);
      } else {
        setTableMenu(ret.search.table_menu[table_menu_key]);
        //不再需要默认设置第一个菜单的id了，需要自己在后端实现 未传参数是默认读取第一个参数 (会产生两次请求)
      }
      //如果后端传了tab id 那么主动重新设置一次
      if (ret.search?.table_menu_id) {
        console.log('server set table_menu_id', ret.search?.table_menu_id);
        setTableMenuId(ret.search?.table_menu_id);
      }
    }
    setData([...ret.data]);
    return Promise.resolve({ data: ret.data, success: ret.success, total: ret.total });
  };
  const [modalApi, modalHolder] = Modal.useModal();
  const { messageApi } = useContext(SaDevContext);
  const post = async (base: any, extra: any, requestRes: any) => {
    return await request.post(url, {
      data: { base: { ...base }, ...extra },
      messageApi,
      ...requestRes,
    });
  };

  const remove = (id, msg: string) => {
    const modals = modalApi.confirm({
      title: '温馨提示！',
      content: msg,
      onOk: async () => {
        const ret = await request.delete(url + '/1', {
          data: { id },
        });
        modals.destroy();
        const re = await afterDelete?.(ret);
        if (!ret.code) {
          if (re != true) {
            actionRef.current?.reload();
          }

          setSelectedRowKeys([]);
        }
      },
    });
  };

  const switchState = (id, msg: string, val: string) => {
    const modals = modalApi.confirm({
      title: '温馨提示！',
      content: msg,
      onOk: async () => {
        const ret = await request.post(url, {
          data: { id, state: val, actype: 'state' },
        });
        modals.destroy();
        if (!ret.code) {
          actionRef.current?.reload();
          setSelectedRowKeys([]);
        }
      },
    });
  };

  const rowNode = useMemo(() => {
    if (selectedRowKeys.length <= 0 || setting.show_selectbar === false) return undefined;
    return (
      <ToolBarDom
        key="table_row_select_bar"
        selectRowBtns={selectRowBtns}
        selectedIds={selectedRowKeys}
        remove={remove}
        switchState={switchState}
        deleteable={deleteable}
        devEnable={devEnable}
      />
    );
  }, [selectedRowKeys, enums, setting, selectRowBtns]);

  const rowDom = useMemo(() => {
    if (selectRowRender) {
      //console.log('now rownode', rowNode);
      return selectRowRender(rowNode);
    }
    return undefined;
  }, [selectRowRender, rowNode]);

  //封装操作方法到context中
  const saTableContext = {
    edit: (record: any, ext: any) => {
      if (openType == 'drawer' || openType == 'modal') {
        setCurrentRow({ id: record.id, ...ext });
        handleModalVisible(true);
      } else {
        history.push(path + '/' + record?.id);
      }
    },
    view: (record: any) => {
      if (openType == 'drawer' || openType == 'modal') {
        setCurrentRow({ id: record.id, readonly: true });
        handleModalVisible(true);
      } else {
        history.push(path + '/' + record?.id + '?readonly=1');
      }
    },
    delete: (record: any) => {
      const title = Array.isArray(titleField)
        ? getFromObject(record, titleField)
        : record[titleField];
      //console.log(title);
      remove(record.id, '确定要删除：' + (title ? title : '该条记录吗？'));
    },
  };

  const onTableReload = () => {
    //重载后的动作 清除checkbox值
    setSelectedRowKeys([]);
    return false;
  };

  const getTableColumnsRender = (columns) => {
    return getTableColumns({
      setData,
      data,
      post,
      enums,
      initRequest,
      columns,
      actionRef,
      initialState,
      devEnable,
      ...props,
    });
  };

  useEffect(() => {
    setDevEnable(pdevEnable && !initialState?.settings?.devDisable && initialState?.settings?.dev);
  }, [initialState?.settings?.devDisable]);

  useEffect(() => {
    setTbColumns(getTableColumnsRender(tableColumns));
  }, [tableColumns, initRequest, devEnable]);

  const tableDesigner = useTableDesigner({
    pageMenu,
    setColumns: setTbColumns,
    getColumnsRender: getTableColumnsRender,
    devEnable,
  });
  return (
    <SaContext.Provider
      value={{
        actionRef,
        searchFormRef,
        formRef,
        searchData: enums,
        columnData,
        url,
        saTableContext,
        tableDesigner,
      }}
    >
      <>
        {modalHolder}
        <ProTable
          components={components}
          className="sa-pro-table"
          rowClassName={() => 'editable-row'}
          actionRef={actionRef}
          onLoad={() => {
            return onTableReload();
          }}
          params={{
            ...paramExtra,
            ...(table_menu_key ? { [table_menu_key]: tableMenuId } : {}),
          }}
          columns={tbColumns}
          request={rq}
          formRef={searchFormRef}
          searchFormRender={(p, d) => {
            return <DndContext>{d}</DndContext>;
          }}
          search={
            search_config.length > 0
              ? {
                  span: 6,
                  className: 'posts-table posts-table-' + pageType,
                  labelWidth: 'auto',
                }
              : false
          }
          revalidateOnFocus={false}
          form={
            pageType != 'page'
              ? false
              : {
                  variant: 'filled',
                  ignoreRules: false,
                  syncToInitialValues: false,
                  style: { padding: 16 },
                  syncToUrl: (values, type) => {
                    //console.log('syncToUrl', values, type);
                    if (pageType != 'page') {
                      //只有在页面显示的table 搜索数据才会同步到url中
                      return false;
                    }
                    if (type === 'get') {
                      for (var i in values) {
                        if (/^\d+$/.test(values[i])) {
                          if (!enumNames || enumNames.findIndex((v) => v == i) < 0) {
                            //如果长度过长 那应该不是数字不要格式化它
                            if (values[i].length <= 8) {
                              values[i] = parseInt(values[i]);
                            }
                          }
                        }
                      }
                      for (var i in values) {
                        if (isJsonString(values[i])) {
                          let jval = JSON.parse(values[i]);
                          // if (!Array.isArray(jval)) {
                          //   values[i] = jval;
                          // }
                          values[i] = jval;
                        } else {
                          //检测 是否是逗号拼接的数组
                          if (isStr(values[i]) && values[i].indexOf(',') > -1) {
                            values[i] = values[i].split(',');
                          }
                          if (isArr(values[i])) {
                            //数组的话检测里面的数据是否是数字，系统会默认将同一名字的query参数整合到数组中 并且数字变成了字符串
                            values[i] = values[i].map((v) => {
                              if (isStr(v) && /^\d+$/.test(v)) {
                                v = parseInt(v);
                              }
                              return v;
                            });
                          }
                        }
                      }
                      const ret = { ...values };
                      return ret;
                    }

                    for (var i in values) {
                      if (typeof values[i] == 'object') {
                        values[i] = JSON.stringify(values[i]);
                      }
                    }
                    return values;
                  },
                }
          }
          toolBarRender={toolBarRender({
            setCurrentRow,
            handleModalVisible,
            paramExtra,
            enums,
            tableMenuId,
            table_menu_key,
            selectedRowKeys,
            devEnable,
            pageMenu,
            sort,
            ...props,
          })}
          rowSelection={
            !checkEnable || setting?.checkDisable
              ? false
              : {
                  selectedRowKeys,
                  onChange: (newSelectedRowKeys, selectedRows) => {
                    //console.log('newSelectedRowKeys', newSelectedRowKeys);
                    setSelectedRowKeys(newSelectedRowKeys);
                  },
                  checkStrictly: false,
                  columnWidth: 80,
                  renderCell: (checked, record, index, originNode) => {
                    return !setting?.table?.checkHoverDisable ? (
                      <TableIndex
                        checked={checked}
                        record={record}
                        index={index}
                        originNode={originNode}
                      />
                    ) : (
                      originNode
                    );
                  },
                }
          }
          toolbar={
            tableMenu
              ? {
                  menu: {
                    type: 'tab',
                    activeKey: tableMenuId,
                    items: tableMenu?.map((v) => ({ label: v.label, key: v.value + '' })),
                    onChange: (key) => {
                      setTableMenuId(key as string);
                      if (pageType == 'page') {
                        let url_search = search2Obj();
                        //return;
                        url_search[table_menu_key] = key;
                        setUrlSearch(url_search);
                      }
                    },
                  },
                }
              : { title: tableTitle ? tableTitle : '列表' }
          }
          tableAlertRender={false}
          summary={(data) => {
            return summary ? (
              <tr>
                <td
                  colSpan={tableColumns.length}
                  dangerouslySetInnerHTML={{ __html: summary }}
                ></td>
              </tr>
            ) : null;
          }}
          scroll={{ x: 900 }}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            ...setting?.pagination,
          }}
          {...tableProps}
          {...setting?.table}
          rowKey="id"
        />
        <TableForm
          {...props}
          createModalVisible={createModalVisible}
          handleModalVisible={handleModalVisible}
          paramExtra={paramExtra}
          currentRow={currentRow}
          afterFormPost={async (ret) => {
            const re = await props?.afterFormPost?.(ret);
            if (re != true) {
              actionRef?.current?.reload();
            }
          }}
        />

        {pageType == 'page' && rowNode && (
          <DndContext>
            <FooterToolbar>{rowNode}</FooterToolbar>
          </DndContext>
        )}
        {rowDom}
      </>
    </SaContext.Provider>
  );
};

export default SaTable;
