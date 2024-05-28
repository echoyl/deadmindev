import request, { messageLoadingKey } from '@/services/ant-design-pro/sadmin';
import { TableDropdown } from '@ant-design/pro-components';
import { history, Link, useModel } from '@umijs/max';
import { Button, Space } from 'antd';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash';
import { useContext } from 'react';
import { isArr, isUndefined } from '../checkers';
import { TableColumnTitle } from '../dev/table/title';
import { getFromObject, t, tplComplie } from '../helpers';
import { defaultColumnsLabel } from './formDom';
import { SaContext } from './table';

const SaTableAction = (props) => {
  const { openType } = props;
  return openType == 'drawer' || openType == 'modal' ? (
    <DrawerAction {...props} />
  ) : (
    <LinkAction {...props} />
  );
};

const LinkAction = (props) => {
  const { record, path, editable, deleteable, level, openType } = props;

  return (
    <Space>
      <Link key="viewLink" to={(path ? path + '/' : './') + record?.id + '?readonly=1'}>
        {t('view')}
      </Link>
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
  const { record, editable, deleteable, level, openType } = props;
  const { saTableContext } = useContext(SaContext);
  const items: Array<'view' | 'edit' | 'delete' | ''> = [
    'view',
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
          <Button
            type="link"
            key={item}
            onClick={async (e: any) => {
              saTableContext?.[item](record);
            }}
          >
            {t(item)}
          </Button>
        );
      })}
    </Space>
  );
};

const DeleteActionRender = (props) => {
  const { record, level, deleteable, openType } = props;
  const { saTableContext } = useContext(SaContext);
  const { initialState } = useModel('@@initialState');
  //console.log('level and record', level, record);
  return isUndefined(record?._level) || record?._level + 1 >= level ? (
    deleteable ? (
      <Button
        type="link"
        danger
        key="deleteItem"
        onClick={async (e: any) => {
          saTableContext?.delete(record);
        }}
      >
        {t('delete')}
      </Button>
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
              window.location.pathname.replace(initialState?.settings?.baseurl, '/') +
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

export const getTableColumns = (props) => {
  const {
    setData,
    data,
    initRequest = false,
    post,
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
  } = props;

  if (!initRequest) return [];
  const allLabels = { ...defaultColumnsLabel, ...labels };
  const defaulColumns = {
    displayorder: {
      title: allLabels.displayorder,
      dataIndex: 'displayorder',
      search: false,
      sorter: (a, b) => a.displayorder - b.displayorder,
      width: 120,
      onCell: (record, index) => ({
        record,
        editable: true,
        dataIndex: 'displayorder',
        title: '排序',
        width: 120,
        handleSave: async (row) => {
          if (row.displayorder == record.displayorder) {
            return;
          }
          const oldV = record.displayorder;
          record.displayorder = row.displayorder;
          setData([...data]);
          const ret = await post(
            { id: row.id },
            { actype: 'displayorder', displayorder: row.displayorder },
          );

          //const success = true;
          if (ret.code) {
            //失败后将数据设置回去
            record.displayorder = oldV;
            setData([...data]);
          } else {
            //actionRef?.current?.reload();
          }
        },
      }),
    },

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
        />
      ),
    },
  };
  const customerColumns =
    typeof columns == 'function' ? columns(enums, actionRef) : cloneDeep(columns);
  //const allColumns = [...defaulColumns, ...customerColumns];

  const parseColumns = (v) => {
    const df = v.valueType ? defaulColumnsRender(v.valueType) : false;
    if (df) {
      df.uid = v.uid;
      const fixed = v.fixed;
      v = cloneDeep(df);
      //设置fixed
      if (fixed) {
        v.fixed = fixed;
      }
    }

    //加入if条件控制
    if (v.fieldProps?.if) {
      const show = tplComplie(v.fieldProps?.if, { record: enums, user: initialState?.currentUser });
      //console.log('v.fieldProps?.if', v.fieldProps?.if, show);
      if (!show) {
        return undefined;
      }
    }
    if (v.requestParam) {
      v.request = async () => {
        const { data } = await request.get(v.requestParam.url, { params: v.requestParam.params });
        return data;
      };
    }
    let options = [];
    if (v.requestDataName) {
      options = enums?.[v.requestDataName];
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

    v.fieldProps = {
      ...v.fieldProps,
      dataindex: v.dataIndex,
    };

    if (devEnable) {
      v.title = <TableColumnTitle {...v} />;
    }

    return v;
  };
  const defaulColumnsRender = (type: string) => {
    if (type == 'coption') {
      type = 'option';
    }
    if (defaulColumns[type]) {
      //console.log(defaulColumns[c]);
      return defaulColumns[type];
    }
    return false;
  };
  const _columns = customerColumns
    ?.map((c) => {
      if (typeof c == 'string') {
        const dr = defaulColumnsRender(c);
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
      return typeof c != 'undefined' && (c.dataIndex != 'id' || c.valueType);
    });
  //console.log('_columns is', _columns);
  return _columns;
};
