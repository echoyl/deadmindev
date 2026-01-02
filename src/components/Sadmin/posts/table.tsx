import request from '@/components/Sadmin/lib/request';
import type {
  ActionType,
  ProFormInstance,
  ProFormProps,
  ProTableProps,
} from '@ant-design/pro-components';
import { FooterToolbar } from '@ant-design/pro-components';
import { history, useModel, useSearchParams } from '@umijs/max';
import { GetProps, Table } from 'antd';
import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import { size } from 'es-toolkit/compat';
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getJson, inArray, isArr, isFn, isObj, isPlainObj, isStr, isUndefined } from '../checkers';
import { SaDevContext } from '../dev';
import { DndContext } from '../dev/dnd-context';
import sortDragEnd from '../dev/dnd-context/displayorder';
import DndKitContext from '../dev/dnd-context/dragSort';
import type { tableDesignerInstance } from '../dev/table/designer';
import { useTableDesigner } from '../dev/table/designer';
import { TableForm } from '../dev/table/form';
import ResizableTitle from '../dev/table/resizeableTitle';
import TableIndex from '../dev/table/tableIndex';
import { ToolBarDom, toolBarRender } from '../dev/table/toolbar';
import { tplToDate } from '../helper/functions';
import type { saFormColumnsType, saFormTabColumnsType, saTableColumnsType } from '../helpers';
import { getFromObject, search2Obj, t } from '../helpers';
import { EditableCell, EditableRow } from './editable';
import './style.less';
import { getTableColumns } from './tableColumns';
import TableRender from './tableRender';
interface TableRecordType {
  id: number;
  [key: string]: any;
}

interface TableParamsType {
  current?: number;
  pageSize?: number;
  [key: string]: any;
}
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
  tableProps?: ProTableProps<TableRecordType, TableParamsType>;
  tabs?: saFormTabColumnsType;
  /**
   * 删除操作时 弹出提示数据所展示的字段
   */
  titleField?: string | string[];
  formProps?: ProFormProps;
  //左侧分类菜单的 配置信息
  leftMenu?: {
    name?: string;
    url_name?: string;
    field?: Record<string, any>;
    title?: string;
    close?: boolean;
    page?: number;
  };
  categorysName?: string;
  //table组件 toolbar中menu 请求和url中参数name
  table_menu_key?: string; //列表头部tab切换读取的数据字段名称
  table_menu_all?: boolean; //tab 是否需要自动加入全部选项
  table_menu_default?: string; //默认的tab值
  //actionRef 实例
  actionRef?: React.RefObject<ActionType>;
  //表单实例
  formRef?: React.RefObject<ProFormInstance>;
  pageType?: 'page' | 'drawer' | 'modal'; //table页面是page还是在弹出层中
  rowOnSelected?: any; //当列表checkbox被点击时触发事件
  paramExtra?: Record<string, any>; //后台其它设置中添加的请求额外参数，table request的时候会带上这些参数
  postExtra?: Record<string, any>; //表单提交时 额外传输的数据 不放在base中
  addable?: boolean; //是否可以新建 控制显示新建按钮
  editable?: boolean; //form打开后没有底部提交按钮
  deleteable?: boolean; //table中是否可以删除数据
  path?: string; //当前页面的路径
  checkEnable?: boolean; //数据是否可以check
  toolBarButton?: { title?: string; valueType?: string; [key: string]: any }[]; //操作栏按钮设置
  selectRowRender?: (rowdom: any) => void | boolean;
  selectRowBtns?: Record<string, any>[];
  pageMenu?: Record<string, any>; //当前菜单信息
  devEnable?: boolean; //是否开启开发模式
  setting?: {
    table?: GetProps<typeof Table> & { checkHoverDisable?: boolean };
    [key: string]: any;
  }; //其它配置统一放这里
  afterDelete?: (ret: any) => void | boolean | Promise<boolean | void>; //删除数据后的回调
  afterFormPost?: (ret: any) => void | boolean | Promise<boolean | void>; //表单提交数据后的回调
  initPageUid?: string; //控制页面刷新 非request
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
    cell: ResizableTitle,
  },
};
interface saTableContextProps {
  edit: (...record: Record<string, any>[]) => void;
  view: (id: any) => void;
  delete: (id: any) => void;
}
export const SaContext = createContext<{
  actionRef?: any;
  formRef?: any;
  columnData?: Record<string, any> | boolean;
  searchData?: Record<string, any>;
  url?: string;
  tableDesigner?: tableDesignerInstance;
  saTableContext?: saTableContextProps;
  searchFormRef?: any;
  selectedRowKeys?: any[];
}>({});

const SaTable: React.FC<saTableProps> = (props) => {
  const {
    url = '',
    tableColumns,
    openType = 'page',
    beforeTableGet,
    titleField = 'title',
    table_menu_key,
    table_menu_all = true,
    table_menu_default = '',
    pageType = 'page',
    paramExtra = {},
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
    pageMenu: oPageMenu,
    devEnable: pdevEnable = true,
    setting = {},
    afterDelete,
    initPageUid,
  } = props;
  //console.log('tableprops', props);
  const [pageMenu, setPageMenu] = useState<Record<string, any> | undefined>(oPageMenu);
  const [tbColumns, setTbColumns] = useState<saTableColumnsType>([]);
  const [enums, setEnums] = useState<Record<string, any>>();
  const [summary, setSummary] = useState(); //合计
  const [footer, setFooter] = useState(); //footer设置
  const [columnData, setColumnData] = useState({});
  const [data, setData] = useState<Record<string, any>[]>([]);
  //当前数据总量
  const [total, setTotal] = useState<number>(0);
  //分页设置
  const [currentPageSize, setCurrentPageSize] = useState<number>(
    setting?.pagination?.pageSize ? setting?.pagination?.pageSize : 20,
  );
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [initRequest, setInitRequest] = useState<boolean>(false);
  const [initPage, setInitPage] = useState<boolean>(false); //是否已经初始化页面 table列变化
  //const url = 'posts/posts';
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  //记录当前的排序规则
  const [sort, setSort] = useState({});
  //跳转链接带参数后，保持多余的参数
  const [exceptUrlParam, setExceptUrlParam] = useState<Record<string, any>>({});

  //const actionRef = props.actionRef ? props.actionRef : useRef<ActionType>();
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);

  const searchFormRef = useRef<ProFormInstance>(null);
  const [currentRow, setCurrentRow] = useState({});

  const [searchParams, setUrlSearch] = useSearchParams();

  const [tableMenu, setTableMenu] = useState<Record<string, any>[]>();
  const searchTableMenuId =
    table_menu_key && pageType == 'page' ? searchParams.get(table_menu_key) : '';
  //console.log('searchTableMenuId', searchTableMenuId, searchParams.get(table_menu_key));
  const [tableMenuId, setTableMenuId] = useState<string>(
    searchTableMenuId ? searchTableMenuId : table_menu_default,
  );
  const _tableColumns: any[] = tableColumns
    ? isFn(tableColumns)
      ? tableColumns([])
      : [...tableColumns]
    : [];
  const enumNames = _tableColumns?.filter((v) => v.valueEnum).map((v) => v.dataIndex);
  const searchDefaultValues: Record<string, any> = {};
  const search_config = _tableColumns?.filter((v: Record<string, any>) => {
    const is_search =
      isObj(v) &&
      (isUndefined(v.search) || v.search) &&
      !['displayorder', 'option'].includes(v.valueType);
    if (is_search && !isUndefined(v.initialValue)) {
      searchDefaultValues[v.dataIndex] = tplToDate(v.initialValue);
    }
    return is_search;
  });

  const { initialState } = useModel('@@initialState');
  const [devEnable, setDevEnable] = useState(
    pdevEnable && !initialState?.settings?.devDisable && initialState?.settings?.adminSetting?.dev,
  );
  // const [enumNames, setEnumNames] = useState<any[]>([]);
  // const [search_config, setSearch_config] = useState<any[]>([]);
  const paramsFormat = (cols, value, key) => {
    const tcolumn = cols?.find((v) => v.dataIndex == key);
    if (tcolumn && value) {
      //月份区间选择器获取到的值经行格式化 这个是pro-component的bug
      if (tcolumn.valueType == 'dateMonthRange') {
        const ov = isStr(value) ? JSON.parse(value) : value;
        return ov
          ? JSON.stringify([dayjs(ov[0]).format('YYYY-MM'), dayjs(ov[1]).format('YYYY-MM')])
          : '';
      }
    }
    return isObj(value) ? JSON.stringify(value) : value;
  };
  /**
   * 获取第一个链式key {user:{username:"test"}} => ["user","username"]
   * @param obj
   * @param fkey
   * @returns
   */
  const getFirstChainKeys = (obj: Record<string, any>, fkey: string): string[] => {
    let ret: string[] = [];
    for (const key in obj) {
      if (isPlainObj(obj[key])) {
        ret = [fkey, ...getFirstChainKeys(obj[key], key)];
      } else {
        ret = [fkey, key];
      }
      break;
    }
    return ret;
  };
  const rq = async (params: Record<string, any> = {}, sort: any, filter: any) => {
    const { pageSize, current } = params;
    setCurrentPageSize(pageSize);
    setCurrentPage(current);
    const pageIsChange = currentPage != current || pageSize != currentPageSize;
    if (!url) {
      setInitRequest(true);
      return [];
    }

    if (size(sort)) {
      params.sort = sort;
    }
    if (size(filter)) {
      params.filter = filter;
    }
    const params_keys = []; //保存params的key
    for (const i in params) {
      if (isPlainObj(params[i])) {
        params_keys.push(getFirstChainKeys(params[i], i));
      } else {
        params_keys.push(i);
      }
      params[i] = paramsFormat(_tableColumns, params[i], i);
    }
    if (!params.reloadUid) {
      delete params.reloadUid;
    }
    setSort(sort);
    //检测分页信息，如果已全部返回数据 分页或修改pagesize后不再请后接口数据
    if (pageIsChange && data && data.length > 0 && data.length == total) {
      return Promise.resolve({ data, success: true, total });
    }
    const ret = await request.get(url, { params: { ...params, ...exceptUrlParam } });
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
    if (ret.search.footer) {
      setFooter(ret.search.footer);
    }
    if (!initPage) {
      //将页面开发参数变化的设置单独放这和initRequest区分开
      setEnums({ ...ret.search });
      setColumnData({ ...ret.search }); //做成context 换一个名字
    }

    if (!initPage) {
      setInitPage(true);
    }

    if (!initRequest) {
      //设置查询form的初始值
      if (!isArr(ret.search) && ret.search.values) {
        // const getfieldsValue = searchFormRef.current?.getFieldsValue();
        // searchFormRef.current?.setFieldsValue({ ...ret.search.values, ...getfieldsValue });
        //有初始值需要同步到url中
        //const url_search = search2Obj();
        //setUrlSearch({ ...ret.search.values, ...url_search });
      }
      if (Object.keys(searchDefaultValues).length > 0) {
        const url_search = search2Obj();
        setUrlSearch({ ...searchDefaultValues, ...url_search });
      }

      //这里需要检测url参数 和 form表单的参数是否有不一致，如果有的话需要将多余的参数设置到paramExtra 中
      //因为点击search后会将这些参数过滤掉（通过带参数链接跳转的页面如果参数不在form中再搜索会导致参数丢失）
      //只在第一次初始化请求时计算

      const exceptNames = ['current', 'pageSize', ...Object.keys(paramExtra), table_menu_key];

      search_config?.map((v) => {
        exceptNames.push(v.dataIndex);
      });

      const nowName = params_keys.filter((v) => {
        return inArray(v, exceptNames) < 0;
      });
      if (nowName.length > 0) {
        const newExceptUrlParam: Record<string, any> = {};
        nowName.forEach((v) => {
          newExceptUrlParam[v] = params[v];
        });
        setExceptUrlParam(newExceptUrlParam);
      }
    }

    //log('setEnums', ret.search);
    //获取分类父级路径
    if (!initRequest) {
      setInitRequest(true);
    }
    if (ret.search?.table_menu && !initRequest && table_menu_key) {
      //如果后端传了tab id 那么主动重新设置一次
      if (ret.search?.table_menu_id) {
        console.log('server set table_menu_id', ret.search?.table_menu_id);
        //这里会再次请求体验不好，所以请在菜单其它配置中设置 table_menu_default
        setTableMenuId(ret.search?.table_menu_id);
      }
    }
    setData([...ret.data]);
    setTotal(ret.total);
    return Promise.resolve({ data: ret.data, success: ret.success, total: ret.total });
  };
  useEffect(() => {
    if (enums && enums.table_menu && table_menu_key && enums.table_menu[table_menu_key]) {
      if (table_menu_all) {
        setTableMenu([{ label: t('all'), value: 'all' }, ...enums.table_menu[table_menu_key]]);
      } else {
        setTableMenu(enums.table_menu[table_menu_key]);
        //不再需要默认设置第一个菜单的id了，需要自己在后端实现 未传参数是默认读取第一个参数 (会产生两次请求)
      }
    }
  }, [table_menu_key, enums, table_menu_all]);

  useEffect(() => {
    if (initPageUid) {
      setInitPage(false);
    }
  }, [initPageUid]);

  const { modalApi, isMobile } = useContext(SaDevContext);

  const remove = (id: number | string, msg: string) => {
    const modals = modalApi?.confirm({
      title: '温馨提示！',
      content: msg,
      onOk: async () => {
        const ret = await request.delete(url + '/1', {
          data: { id },
        });
        modals?.destroy();
        if (!ret) {
          return;
        }
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

  const switchState = (id: number | string, msg: string, val: string) => {
    const modals = modalApi?.confirm({
      title: '温馨提示！',
      content: msg,
      onOk: async () => {
        const ret = await request.post(url, {
          data: { id, state: val, actype: 'state' },
        });
        modals?.destroy();
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

  const getTableColumnsRender = (columns: Record<string, any>[]) => {
    return getTableColumns({
      setData,
      data,
      //post,
      url,
      enums,
      initRequest,
      columns,
      actionRef,
      initialState,
      devEnable,
      viewable: setting?.viewable,
      checkDisable: !checkEnable || setting?.checkDisable,
      variant: setting?.form?.variant || 'filled',
      ...props,
    });
  };

  useEffect(() => {
    setDevEnable(
      pdevEnable &&
        !initialState?.settings?.devDisable &&
        initialState?.settings?.adminSetting?.dev,
    );
  }, [initialState?.settings?.devDisable]);

  useEffect(() => {
    if (enums) {
      setTbColumns(getTableColumnsRender(tableColumns));
    }
  }, [tableColumns, initRequest, devEnable, enums]);

  const tableDesigner = useTableDesigner({
    pageMenu,
    setPageMenu,
    setColumns: setTbColumns,
    getColumnsRender: getTableColumnsRender,
    devEnable,
    tbColumns,
  });
  const [minHeight, setMinHeight] = useState<number>(209);

  useEffect(() => {
    let defaultHeight = 209;
    if (pageType == 'drawer') {
      defaultHeight -= 50;
    }
    if (footer) {
      defaultHeight += 38;
    }
    if (tableProps.pagination !== false && data.length > 0) {
      defaultHeight += 40;
    }
    if (search_config.length > 0) {
      defaultHeight += 80;
    } else {
      if (pageType == 'drawer') {
        defaultHeight -= 16;
      }
    }
    if (tableMenu && table_menu_key) {
      defaultHeight += 14;
    }
    setMinHeight(defaultHeight);
  }, [footer, tableProps.pagination, search_config, tableMenu, table_menu_key, data]);

  const useStyles = createStyles(
    (
      { css },
      { height, tableSize }: { height: number; tableSize: 'small' | 'middle' | 'large' },
    ) => {
      //table组件中关闭scroll类名为ant-table-content开启scroll 是 ant-table-body 不包含头部所以需要计算头部高度
      //根据table尺寸来计算最小高度值
      const heightSizes = {
        small: 0,
        middle: 8,
        large: 16,
      };
      const dis_header_height = heightSizes[tableSize];
      if (height) {
        return {
          body: css`
            .ant-table-content {
              min-height: calc(100vh - ${height}px);
            }
            .ant-table-body {
              min-height: calc(100vh - ${height + 39 + dis_header_height}px);
            }
          `,
        };
      } else {
        return {};
      }
    },
  );
  const { styles } = useStyles({
    height: setting?.minHeightFullscreen !== false && pageType != 'modal' ? minHeight : 0,
    tableSize: tableProps.size || setting?.table?.size || 'middle',
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
        selectedRowKeys,
      }}
    >
      <>
        <DndKitContext
          list={data}
          idName="id"
          restrict="vertical"
          onDragEnd={sortDragEnd(url, data, (list) => {
            setData([...list]);
          })}
        >
          <TableRender
            tableColumns={tableColumns}
            devEnable={devEnable}
            allProps={{ ...props, setSelectedRowKeys, selectedRowKeys }}
            components={components}
            className={['sa-pro-table', `sa-${pageType}-table`, styles.body]}
            //classNames={{ root: 'sa-pro-table' }}
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
            dataSource={data}
            formRef={searchFormRef}
            searchFormRender={(p: any, d: any) => {
              return <DndContext>{d}</DndContext>;
            }}
            search={
              search_config.length > 0
                ? {
                    span: isMobile ? 24 : 6, //手机端占满一行
                    //className: 'posts-table posts-table-' + pageType,
                    labelWidth: 'auto',
                  }
                : false
            }
            revalidateOnFocus={false}
            form={
              pageType != 'page'
                ? {
                    variant: setting?.form?.variant || 'filled',
                    style: { padding: 16 },
                  }
                : {
                    variant: setting?.form?.variant || 'filled',
                    ignoreRules: false,
                    syncToInitialValues: false,
                    style: { padding: 16 },
                    extraUrlParams: exceptUrlParam,
                    syncToUrl: (values: Record<string, any>, type: string) => {
                      if (pageType != 'page') {
                        //只有在页面显示的table 搜索数据才会同步到url中
                        return false;
                      }
                      if (type === 'get') {
                        for (let i in values) {
                          if (/^\d+$/.test(values[i])) {
                            if (!enumNames || enumNames.findIndex((v) => v == i) < 0) {
                              //如果长度过长 那应该不是数字不要格式化它
                              if (values[i].length <= 8) {
                                values[i] = parseInt(values[i]);
                              }
                            }
                          }
                        }
                        for (let i in values) {
                          const jval = getJson(values[i], '');
                          if (isObj(jval)) {
                            values[i] = jval;
                          } else {
                            //检测 是否是逗号拼接的数组
                            if (isStr(values[i]) && values[i].indexOf(',') > -1) {
                              values[i] = values[i].split(',');
                            }
                          }
                          if (isArr(values[i])) {
                            //数组的话检测里面的数据是否是数字，系统会默认将同一名字的query参数整合到数组中 并且数字变成了字符串
                            values[i] = values[i].map((v: any) => {
                              if (isStr(v) && /^\d+$/.test(v)) {
                                v = parseInt(v);
                              }
                              if (isStr(v)) {
                                //这里日期格式中空格会被转义成+号，这里需要转回来 只在日期区间才做该处理
                                v = v.replace('+', ' ');
                              }
                              return v;
                            });
                          }
                          if (values[i] === '') {
                            delete values[i];
                          }
                        }
                        //将columns配置中设置了defaultvalue的搜索项的默认值添加到request参数中
                        const ret = { ...searchDefaultValues, ...values };
                        return ret;
                      }
                      for (const key in values) {
                        const v = values[key];
                        values[key] = paramsFormat(_tableColumns, v, key);
                        if (values[key] === '') {
                          delete values[key];
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
              initRequest,
              initialState,
              tableMenuId,
              table_menu_key,
              selectedRowKeys,
              devEnable,
              pageMenu,
              sort,
              actionRef,
              ...props,
            })}
            rowSelection={
              !checkEnable || setting?.checkDisable
                ? false
                : {
                    selectedRowKeys,
                    onChange: (newSelectedRowKeys: React.Key[]) => {
                      setSelectedRowKeys(newSelectedRowKeys);
                    },
                    checkStrictly: false,
                    columnWidth: 80,
                    renderCell: (
                      checked: boolean,
                      record: Record<string, any>,
                      index: number,
                      originNode: JSX.Element,
                    ) => {
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
              tableMenu && table_menu_key
                ? {
                    menu: {
                      type: 'tab',
                      activeKey: tableMenuId,
                      items: tableMenu?.map((v) => ({ label: v.label, key: v.value + '' })),
                      onChange: (key: string) => {
                        setTableMenuId(key as string);
                        if (pageType == 'page') {
                          const url_search = search2Obj();
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
            summary={() => {
              const isCheckEnable = !checkEnable || setting?.checkDisable ? false : true;
              const tbc_length =
                _tableColumns?.filter((v) => {
                  return !v.hideInTable;
                }).length + (isCheckEnable ? 1 : 0);
              return summary ? (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={tbc_length}>
                    <div dangerouslySetInnerHTML={{ __html: summary }}></div>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              ) : null;
            }}
            //scroll={{ x: 900 }}
            footer={
              footer
                ? () => {
                    return <div dangerouslySetInnerHTML={{ __html: footer }}></div>;
                  }
                : undefined
            }
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              ...setting?.pagination,
              defaultPageSize: currentPageSize,
              pageSize: currentPageSize,
            }}
            {...tableProps}
            {...setting?.table}
            scroll={
              tableProps?.scroll
                ? tableProps?.scroll
                : setting?.scollYFullscreen
                ? {
                    ...setting?.table?.scroll,
                    y: pageType == 'modal' ? false : `calc(100vh - ${minHeight + 47}px)`,
                  }
                : setting?.table?.scroll
            }
            // styles={
            //   setting?.minHeightFullscreen !== false && pageType != 'modal'
            //     ? {
            //         ...setting.table?.styles,
            //         section: {
            //           minHeight:
            //             setting.table?.styles?.section?.minHeight || `calc(100vh - ${minHeight}px)`,
            //         },
            //       }
            //     : setting.table?.styles
            // }
            rowKey="id"
          />
        </DndKitContext>
        <TableForm
          {...props}
          createModalVisible={createModalVisible}
          handleModalVisible={handleModalVisible}
          paramExtra={paramExtra}
          currentRow={currentRow}
          afterFormPost={(ret) => {
            const re = props?.afterFormPost?.(ret);
            if (re != true) {
              setTimeout(() => actionRef?.current?.reload(), 100);
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
