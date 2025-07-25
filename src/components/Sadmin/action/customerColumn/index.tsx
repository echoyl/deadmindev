import { Link, useModel } from '@umijs/max';
import { Divider, Dropdown, Modal, Popover, QRCode, Space, Table, Timeline } from 'antd';
import React, { useContext, useEffect, useState } from 'react';
import { inArray, isArr } from '../../checkers';
import { getFromObject, getMenuDataById, parseIcon, tplComplie } from '../../helpers';
import { SaContext } from '../../posts/table';
import TableFromBread from '../../tableFromBread';
import ButtonDrawer from '../buttonDrawer';
import ButtonModal from '../buttonModal';
import Confirm from '../confirm';
import ConfirmForm from '../confirmForm';
import Print from '../print';
import RequestComponent from '../request';
import ItemTags from './items/tag';
import DropdownAction from '../../valueTypeMap/dropdownAction';
import dayjs from 'dayjs';
import { ExportButton, ImportButton } from '../../dev/table/toolbar';
import { RequestButtonRender } from '../../components/requestButton';
import ConsoleLogShowFormValue from './items/consolelogformvalue';
import OpenIframe from './items/openiframe';
const CustomerColumnRender = (props) => {
  const {
    items = [],
    record: orecord,
    text,
    paramExtra = {},
    direction = 'horizontal',
    dropdown = { num: 1, text: '···' },
    type = 'table',
    dataindex,
  } = props;
  const { initialState } = useModel('@@initialState');
  //console.log('props ', props);
  const { actionRef, formRef, columnData, url, saTableContext, searchData } = useContext(SaContext);

  //const formValue = formRef?.current?.getFieldsValue?.(true);
  const [record, setRecord] = useState(orecord);
  const [modalApi, modalHolder] = Modal.useModal();
  //console.log('CustomerColumnRender record is  ', orecord, !formRef.current);
  //console.log('formRef', formRef);
  //console.log('dependencies', dependencies);
  //console.log(items);
  useEffect(() => {
    //console.log('type is', type);
    //console.log('record change', orecord);
    if (type == 'form' && formRef.current && Object.keys(formRef.current).length > 0) {
      //添加一个type判断 如果多层嵌套后 formRef 的context会错乱了
      //console.log('formRef is effect', orecord);
      setRecord(formRef.current.getFieldsValue?.(true));
    } else {
      //console.log('record is effect', orecord);
      setRecord(orecord);
    }
  }, [orecord, formRef]);

  //console.log(formValue);
  const parseDom = (item: any, i, percentNum = -1) => {
    let show = true;
    //const key = uid();
    //console.log('record is', record);
    if (item.if) {
      show = tplComplie(item.if, { record, user: initialState?.currentUser });
    }
    if (!show) {
      return '';
    }

    //const { fieldProps = {}, modal } = item;
    //const { value = {} } = fieldProps;
    if (item.domtype == 'divider') {
      return <Divider key={i} type="vertical" />;
    } else if (item.domtype == 'timeline') {
      //处理icon
      //console.log('timeline', item);
      const name = item.props?.name || dataindex;
      const items = record?.[name]?.map((it) => {
        if (it.icon) {
          it.dot = parseIcon(it.icon);
        }
        return it;
      });
      return <Timeline style={{ paddingTop: 10 }} key={i} items={items} {...item.props} />;
    } else if (item.domtype == 'button' || item.domtype == 'text') {
      //tooltip也支持变量读取
      if (item.btn) {
        //return <span onClick={() => console.log('777')}>test</span>;
        const styleProps = percentNum >= 0 && i >= percentNum ? { style: { width: '100%' } } : {};
        return RequestButtonRender({ record, ...item, styleProps, initialState });
      } else {
        //未设置dataindex时 返回的时record导致报错
        return dataindex ? text : '';
      }
    } else if (item.domtype == 'actions') {
      //console.log('actions', record);
      return <CustomerColumnRender type={type} key={i} items={record.items} record={record} />;
    } else if (item.domtype == 'qrcode') {
      //console.log('actions', record);
      if (item.btn) {
        const { text = '', size = 'small', errorLevel = 'M' } = item.btn;
        const tpl = tplComplie(text, { record });
        const sizeArr = { small: 120, middle: 160, large: 200 };
        return <QRCode key={i} value={tpl} size={sizeArr[size]} errorLevel={errorLevel} />;
      }
    } else if (item.domtype == 'tag' || item.domtype == 'Badge') {
      //console.log('tag text', text, item);
      if (text === false || text === '') {
        return null;
      }
      return (
        <ItemTags
          key={i}
          dataindex={dataindex}
          tags={isArr(text) ? text : [text]}
          color={item.color}
          bordered={item.bordered}
          icon={item.icon}
          ellipsis={item.ellipsis}
          type={item.domtype}
          data={type == 'table' ? searchData : record}
        />
      );
    } else if (item.domtype == 'table') {
      //读取是否关联了菜单，关联菜单后直接读取该菜单的table列设置
      let tableColumns;
      if (item.page) {
        const menudata = getMenuDataById(initialState?.currentUser?.menuData, item.page);
        //console.log('menudata', menudata);
        tableColumns = menudata ? menudata.data?.tableColumns : [];
      } else {
        tableColumns = item.fieldProps?.value?.columns ? item.fieldProps?.value?.columns : [];
      }
      //console.log('tag text', text, item, initialState?.currentUser?.menuData, tableColumns);
      const dataSource = item.fieldProps?.cal
        ? tplComplie(item.fieldProps.cal, {
            record,
            user: initialState?.currentUser,
            func: true,
          })
        : text;
      return (
        <Table
          key={'table_' + i}
          dataSource={dataSource}
          rowKey="id"
          {...item.fieldProps?.value}
          columns={tableColumns.filter((v) => v.hideInTable !== true && v.title)}
        />
      );
    } else if (item.domtype == 'dayjsfrom') {
      return dayjs(text).fromNow();
    }
    return '';
  };
  const getItemsDom = (items, percentNum = -1) => {
    return items
      ?.map((item, i) => {
        const dom = parseDom(item, i, percentNum);
        const styleProps = percentNum >= 0 && i >= percentNum ? { style: { width: '100%' } } : {};
        //key为固定值，之前用动态uid后导致一些bug
        const key = item.action + '.' + i;
        //console.log('dom', dom, item);
        if (dom === '') return '';
        const { fieldProps = {}, modal } = item;
        const { value = {} } = fieldProps;

        if (item.action == 'confirmForm') {
          const { idName = 'id' } = value;
          const dataId = getFromObject(record, idName);
          return (
            <ConfirmForm
              key={key}
              trigger={dom}
              msg={item.modal?.msg}
              formColumns={item.modal?.formColumns}
              page={item.modal?.page}
              url={item.request?.url}
              postUrl={item.request?.postUrl}
              data={{ ...paramExtra, ...item.request?.data }}
              paramdata={{ ...item.request?.paramdata }}
              afterActionType={item.request?.afterActionType}
              dataId={dataId}
              {...value}
              callback={(ret) => {
                //location.reload();
                if (!ret) {
                  return;
                }
                if (!ret.code) {
                  if (!item.request?.afterActionType || item.request?.afterActionType == 'reload') {
                    actionRef?.current?.reload();
                  }

                  formRef?.current?.setFieldsValue?.({});
                  //formRef?.current?.resetFields();
                }
              }}
            />
          );
        } else if (item.action == 'confirm') {
          //request.data 参数支持读取当前行的数据
          return (
            <Confirm
              key={key}
              dataId={record?.id}
              record={record}
              trigger={dom}
              //trigger={false}
              url={item.request?.url}
              data={{ ...paramExtra, ...item.request?.data }}
              method={item.request?.method ? item.request?.method : 'post'}
              msg={item.modal?.msg}
              title={item.modal?.title}
              type={item.modal?.type}
              afterActionType={item.request?.afterActionType}
            />
          );
        } else if (item.action == 'request') {
          return <RequestComponent key={key} trigger={dom} requestParam={{ ...item.request }} />;
        } else if (item.action == 'print') {
          return (
            <Print
              key={key}
              dataId={record?.id}
              trigger={(click) => <div onClick={click}>{dom}</div>}
              url={item.request?.url}
              data={{ ...paramExtra, ...item.request?.data }}
              record={record}
              title={item.modal?.title}
              {...item.fieldProps?.value}
            />
          );
        } else if (item.action == 'modalTable') {
          //console.log('modalTable record', record);
          if (!fieldProps) {
            return dom;
          }

          return (
            <ButtonModal
              key={key}
              trigger={dom}
              title={modal?.title}
              modalProps={{ footer: null, ...modal?.drawerProps }}
              onCancel={() => {
                actionRef.current?.reload();
              }}
              minHeight={650}
            >
              <TableFromBread
                scrollHeight={450}
                key={key}
                fieldProps={fieldProps}
                menu_page_id={modal?.page}
                record={record}
              />
            </ButtonModal>
          );
        } else if (item.action == 'drawerTable') {
          //console.log('modalTable', fieldProps);
          if (!fieldProps) {
            return dom;
          }

          return (
            <ButtonDrawer
              key={key}
              trigger={dom}
              title={tplComplie(modal?.title, { record })}
              drawerProps={{ ...modal?.drawerProps, styles: { body: { padding: 16 } } }}
              width={1000}
            >
              <TableFromBread
                fieldProps={fieldProps}
                record={record}
                menu_page_id={modal?.page}
                type="drawer"
                scrollHeight="calc(100vh - 330px)"
              />
            </ButtonDrawer>
          );
        } else if (item.action == 'drawer') {
          return (
            <ButtonDrawer
              key={key}
              trigger={dom}
              title={tplComplie(item.modal?.title, { record })}
              drawerProps={item.modal?.drawerProps}
            >
              {item.modal?.childrenRender?.(record)}
            </ButtonDrawer>
          );
        } else if (item.action == 'dropdown') {
          const modelName = item.request?.modelName || dataindex;
          return (
            <DropdownAction
              key={key}
              fieldNames="id,title"
              {...item.request}
              modelName={modelName}
              value={text}
              id={record.id}
              {...value}
            />
          );
        } else if (item.action == 'popover') {
          //检测弹出的类型
          let popcontent = null;
          if (item.popover?.type == 'qrcode') {
            const {
              content = '',
              size = 'small',
              errorLevel = 'M',
              bordered = false,
            } = item.popover;
            const tpl = tplComplie(content, { record });
            const sizeArr = { small: 120, middle: 160, large: 200 };
            popcontent = (
              <QRCode
                key={key}
                value={tpl}
                size={sizeArr[size]}
                errorLevel={errorLevel}
                bordered={bordered}
              />
            );
          } else {
            popcontent = item.popover?.content;
          }
          const trigger = item.popover?.trigger || 'click';
          return (
            <Popover key={key} content={popcontent} trigger={trigger}>
              {dom}
            </Popover>
          );
        } else if (inArray(item.action, ['edit', 'delete', 'view']) > -1) {
          const xkey = key + '_' + item.action;
          return dom
            ? React.cloneElement(dom, {
                key: xkey,
                onClick: async (e: any) => {
                  saTableContext?.[item.action](record, value);
                },
              })
            : null;
        } else if (item.action == 'import') {
          return (
            <ImportButton
              key={key}
              {...item}
              uploadProps={{
                ...item.uploadProps,
                data: { ...item.request?.data, ...item.uploadProps?.data, id: record?.id || 0 },
              }}
              styleProps={styleProps}
            />
          );
        } else if (item.action == 'export') {
          return (
            <ExportButton
              key={key}
              {...item}
              request={{
                ...item.request,
                data: { ...item.request?.data, ids: record?.id ? [record?.id] : [], ...paramExtra },
              }}
              styleProps={styleProps}
            />
          );
        } else if (item.action == 'link') {
          const to = tplComplie(value?.to, { record, user: initialState?.currentUser });
          return (
            <Link key={key} to={to}>
              {dom}
            </Link>
          );
        } else if (item.action == 'alink') {
          const to = tplComplie(value?.href, { record, user: initialState?.currentUser });
          return (
            <a key={key} href={to} target="_blank">
              {dom}
            </a>
          );
        } else if (item.action == 'iframe') {
          return <OpenIframe key={key} trigger={dom} {...value} />;
        } else if (item.action == 'console') {
          return <ConsoleLogShowFormValue key={key} />;
        } else {
          return <span key={key}>{dom}</span>;
        }
      })
      .filter((v) => v);
  };
  if (!record || Object.keys(record).length < 1) {
    //return null;2025-05-17没有record或者record为空则不显示，先关闭这个设置。不知道当时为什么添加这个设置
  }
  //dropdown的设置 num 表示预留几个直接出现 text-显示的文字
  const itemsDom = getItemsDom(
    items,
    direction == 'dropdown' ? (dropdown.num ? dropdown.num : 0) : -1,
  );
  return (
    <>
      {modalHolder}
      {direction == 'dropdown' ? (
        <Space>
          {itemsDom.filter((v, i) => i < dropdown.num)}
          {itemsDom.length > dropdown.num ? (
            <Dropdown
              key="action_dropdown"
              trigger="click"
              menu={{
                items: itemsDom
                  .filter((v, i) => i >= dropdown.num)
                  .map((v, i) => {
                    //console.log(label);
                    return {
                      label: v,
                      key: i,
                    };
                  }),
              }}
            >
              <a onClick={(e) => e.preventDefault()}>{dropdown.text ? dropdown.text : '···'}</a>
            </Dropdown>
          ) : null}
        </Space>
      ) : itemsDom.length == 1 ? (
        itemsDom
      ) : (
        <Space direction={direction}>{itemsDom}</Space>
      )}
    </>
  );
};
export const CustomerColumnRenderTable = (text, props) => {
  const { fieldProps, record } = props;
  const { items } = fieldProps;
  console.log('CustomerColumnRenderTable render', fieldProps);
  //const [formValue, setFormValue] = useState();
  //const { formRef } = useContext(SaContext);
  // if (!record) {
  //   const formValue = formRef?.current?.getFieldsValue?.(true);
  // } else {

  // }

  //console.log('formRef', formRef, props);
  // useEffect(() => {
  //   if (!record && formRef.current) {
  //     setTimeout(() => {
  //       setFormValue(formRef.current.getFieldsValue());
  //     }, 500);
  //   }
  // }, []);
  //console.log(formRef, formValue);
  return <CustomerColumnRender {...fieldProps} record={record ? record : false} text={text} />;
};

export default CustomerColumnRender;
