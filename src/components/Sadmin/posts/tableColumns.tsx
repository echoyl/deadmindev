import request, { messageLoadingKey } from '@/components/Sadmin/lib/request';
import { TableDropdown } from '@ant-design/pro-components';
import { history, Link, useModel } from '@umijs/max';
import { Space, Typography } from 'antd';
import dayjs from 'dayjs';
import { useContext } from 'react';
import { isArr, isUndefined } from '../checkers';
import { TableColumnTitle } from '../dev/table/title';
import { getFromObject, t, tplComplie } from '../helpers';
import { defaultColumnsLabel } from './formDom';
import { SaContext } from './table';
import { tplToDate } from '../helper/functions';
import { cloneDeep } from 'es-toolkit';
import { DragHandle } from '../dev/dnd-context/dragSort';

export const SaTableAction = (props) => {
  const { openType } = props;
  return openType == 'drawer' || openType == 'modal' ? (
    <DrawerAction {...props} />
  ) : (
    <LinkAction {...props} />
  );
};

const LinkAction = (props) => {
  const { record, path, editable, deleteable, level, openType, viewable } = props;

  return (
    <Space>
      {viewable ? (
        <Link key="viewLink" to={(path ? path + '/' : './') + record?.id + '?readonly=1'}>
          {t('view')}
        </Link>
      ) : null}
      {editable ? (
        <Link key="editLink" to={(path ? path + '/' : './') + record?.id}>
          {t('edit')}
        </Link>
      ) : null}
      <DeleteActionRender
        record={record}
        level={level}
        deleteable={deleteable}
        openType={openType}
      />
    </Space>
  );
};

const DrawerAction = (props) => {
  const { record, editable, deleteable, level, openType, viewable } = props;
  const { saTableContext } = useContext(SaContext);
  const { Link } = Typography;
  const items: Array<'view' | 'edit' | 'delete' | ''> = [
    viewable ? 'view' : '',
    editable ? 'edit' : '',
    deleteable ? 'delete' : '',
  ];
  return (
    <Space>
      {items.map((item) => {
        if (!item) {
          return null;
        }
        return item == 'delete' ? (
          <DeleteActionRender
            key={item}
            record={record}
            level={level}
            deleteable={deleteable}
            openType={openType}
          />
        ) : (
          <Link
            key={item}
            onClick={async (e: any) => {
              saTableContext?.[item](record);
            }}
          >
            {t(item)}
          </Link>
        );
      })}
    </Space>
  );
};

const DeleteActionRender = (props) => {
  const { record, level, deleteable, openType } = props;
  const { saTableContext } = useContext(SaContext);
  const { initialState } = useModel('@@initialState');
  const { Link, Text } = Typography;
  //console.log('level and record', level, record);
  return isUndefined(record?._level) || record?._level + 1 >= level ? (
    deleteable ? (
      <Link
        key="deleteItem"
        onClick={async (e: any) => {
          saTableContext?.delete(record);
        }}
      >
        <Text type="danger">{t('delete')}</Text>
      </Link>
    ) : null
  ) : (
    <TableDropdown
      key="actionGroup"
      onSelect={(key) => {
        //action?.reload()

        if (key == 'add') {
          if (openType == 'drawer' || openType == 'modal') {
            saTableContext?.edit(record, { parent_id: record.id, id: 0 });
          } else {
            history.push(
              window.location.pathname.replace(initialState?.settings?.adminSetting?.baseurl, '/') +
                '/0?parent_id=' +
                record.id,
            );
          }
        } else if (key == 'delete') {
          saTableContext?.delete(record);
        }
      }}
      menus={
        deleteable
          ? [
              { key: 'add', name: t('addchild') },
              { key: 'delete', name: t('delete'), danger: true },
            ]
          : [{ key: 'add', name: t('addchild') }]
      }
    />
  );
};

export const onCell = (props) => {
  const { record, index, setData, data, url, dataIndex, type = 'number' } = props;
  const ret = {
    record,
    editable: true,
    dataIndex,
    type,
    handleSave: async (row) => {
      const oldV = record[dataIndex];
      const newV = row[dataIndex];
      if (newV == oldV) {
        return;
      }

      record[dataIndex] = newV;
      setData([...data]);
      const ret = await request.post(url, {
        data: { base: { id: row.id, [dataIndex]: newV }, actype: dataIndex, [dataIndex]: newV }, //兼容actype
      });

      //const success = true;
      if (ret.code) {
        //失败后将数据设置回去
        record[dataIndex] = oldV;
        setData([...data]);
      }
    },
  };
  return ret;
};

export const getTableColumns = (props) => {
  const {
    setData,
    data,
    initRequest = false,
    //post,
    url,
    enums,
    openType = 'page',
    columns,
    labels,
    level = 1,
    actionRef,
    path,
    editable = true,
    deleteable = true,
    initialState,
    devEnable = true,
    viewable = false,
    checkDisable = false,
  } = props;

  if (!initRequest) return [];
  const allLabels = { ...defaultColumnsLabel, ...labels };
  const defaulColumns = {
    // displayorder: {
    //   title: allLabels.displayorder,
    //   dataIndex: 'displayorder',
    //   search: false,
    //   sorter: (a, b) => a.displayorder - b.displayorder,
    //   onCell: (record, index) =>
    //     onCell({ record, url, setData, data, dataIndex: 'displayorder', type: 'number' }),
    // },

    option: {
      title: allLabels.option,
      dataIndex: 'option',
      valueType: 'option',
      fixed: 'right',
      width: 140,
      hideInDescriptions: true,
      render: (text, props) => (
        <SaTableAction
          record={props}
          path={path}
          openType={openType}
          level={level}
          editable={editable}
          deleteable={deleteable}
          viewable={viewable}
        />
      ),
    },
    dragsort: {
      align: 'center',
      width: 80,
      render: () => <DragHandle />,
    },
  };
  const customerColumns =
    typeof columns == 'function' ? columns(enums, actionRef) : cloneDeep(columns);
  //const allColumns = [...defaulColumns, ...customerColumns];

  const parseColumns = (v) => {
    //加入if条件控制
    if (v.fieldProps?.if && !devEnable) {
      const show = tplComplie(v.fieldProps?.if, { record: enums, user: initialState?.currentUser });
      //console.log('v.fieldProps?.if', v.fieldProps?.if, show);
      if (!show) {
        return undefined;
      }
    }

    if (v.editable || v.valueType == 'displayorder') {
      //delete v.valueType;
      if (!v.title) {
        v.title = allLabels?.[v.valueType];
      }
      if (!v.dataIndex) {
        v.dataIndex = v.valueType;
      }
      v.onCell = (record, index) =>
        onCell({
          record,
          url: v.fieldProps?.url ? v.fieldProps?.url : url,
          setData,
          data,
          dataIndex: v.dataIndex,
          type: v.editable?.type,
        });
      v.width = v.width || 120;
    }
    const df = v.valueType ? defaulColumnsRender(v.valueType, v) : false;
    if (df) {
      df.uid = v.uid;
      const fixed = v.fixed;
      v = cloneDeep(df);
      //设置fixed
      if (fixed) {
        v.fixed = fixed;
      }
    }

    if (v.requestParam) {
      v.request = async () => {
        const { data } = await request.get(v.requestParam.url, { params: v.requestParam.params });
        return data;
      };
    }
    let options = [];
    const requestName = v.requestDataName
      ? v.requestDataName
      : v.fieldProps?.requestDataName
        ? v.fieldProps.requestDataName
        : false;
    if (requestName) {
      options = enums?.[requestName];
      delete v.fieldProps?.requestDataName;
      v.fieldProps = {
        ...v.fieldProps,
        options: options ? options : [],
      };
    }

    if (v.valueEnumDataName) {
      v.valueEnum = enums[v.valueEnumDataName];
    }
    //是否开启了排序 如果table有url的话会重新请求到后台获取数据 没有url的话会排序这个table的数据
    if (v.sort) {
      v.sorter = (a, b) => {
        const aval = getFromObject(a, v.dataIndex);
        const bval = getFromObject(b, v.dataIndex);
        return aval - bval;
      };
      delete v.sort;
    }
    //加入合并行设置
    if (v.rowSpan) {
      const rowSpanKey = [v.dataIndex, 'rowSpan'].join('_');
      v.onCell = (_, indx) => {
        return {
          rowSpan: _[rowSpanKey],
        };
      };
      delete v.rowSpan;
    }

    if (v.fieldProps?.showTime?.defaultValue) {
      //console.log('presets is', v);
      if (isArr(v.fieldProps.showTime.defaultValue)) {
        v.fieldProps.showTime.defaultValue = v.fieldProps.showTime.defaultValue.map((val) => {
          if (isArr(val)) {
            return dayjs(val[0], val[1]);
          } else {
            return dayjs(val, 'HH:mm:ss');
          }
        });
        //console.log('showTime is', v);
      } else {
        const vall = v.fieldProps.showTime.defaultValue;
        return dayjs(vall.value, vall.format ? vall.format : 'HH:mm:ss');
      }
    }
    //添加初始值的日期格式化操作
    if (v.initialValue) {
      v.initialValue = tplToDate(v.initialValue);
    }

    v.fieldProps = {
      ...v.fieldProps,
      dataindex: v.dataIndex,
    };

    if (devEnable) {
      v.title = <TableColumnTitle {...v} />;
    }

    return v;
  };
  const defaulColumnsRender = (type: string, customer: any) => {
    if (type == 'coption') {
      type = 'option';
    }
    if (defaulColumns[type]) {
      //console.log(defaulColumns[c]);
      const title = customer?.title || defaulColumns[type]?.title;
      const v = { ...defaulColumns[type], ...customer, title };
      return v;
    }
    return false;
  };
  const _columns = customerColumns
    ?.map((c) => {
      if (typeof c == 'string') {
        const dr = defaulColumnsRender(c, {});
        if (dr && devEnable) {
          dr.title = <TableColumnTitle id={c} {...dr} />;
        }
        return dr
          ? dr
          : {
              //title: allLabels[c],
              title: devEnable ? <TableColumnTitle id={c} title={allLabels[c]} /> : allLabels[c],
              dataIndex: c,
              search: false,
            };
      } else {
        return parseColumns(c);
      }
    })
    .filter((c) => {
      //return typeof c != 'undefined' && c.dataIndex != 'id';
      return (
        typeof c != 'undefined' &&
        (checkDisable || (!checkDisable && (c.dataIndex != 'id' || c.valueType)))
      );
      //return typeof c != 'undefined' && (c.dataIndex != 'id' || c.valueType);
    });
  //console.log('_columns is', _columns);
  return _columns;
};
