import { useModel } from '@umijs/max';
import { isUndefined } from 'es-toolkit';
import type { FC } from 'react';
import React, { useCallback, useContext, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { isBool } from '../checkers';
import { getBread, getFromObject, getMenuDataById, tplComplie } from '../helpers';
import SaTable, { SaContext } from '../posts/table';

const TableFromBread: FC<{
  fieldProps?: any;
  record?: any;
  readonly?: string | boolean; //支持条件判断
  alwaysenable?: boolean; //是否一直可用 默认false 当是表单是 如果无主数据表格不会展示，true 都会展示
  type?: 'drawer' | 'page' | 'modal'; //列表所在页面类型.如果是drawer selectdom会设置在footer
  scrollHeight?: number | string; //外部高度
  contentRender?: any;
  menu_page_id?: number; //引用已有菜单的id
}> = (props) => {
  const {
    fieldProps = { props: {} },
    readonly,
    record: orecord,
    alwaysenable = false,
    type = 'page',
    contentRender,
    scrollHeight = 0,
    menu_page_id = 0,
  } = props;
  //console.log('fieldProps', fieldProps);
  const { formRef } = useContext(SaContext);
  //在form中渲染 必须是readonly 所以用formRef 获取当前表单的所有值
  const record = orecord ? orecord : formRef?.current?.getFieldsValue?.(true);
  //console.log('record is', record, orecord, formRef);
  let readonlyProps = {};
  if (isUndefined(readonly)) {
    //如果未传参数 那么通过已设定的path菜单的设置
  } else {
    const readonly_result = isBool(readonly) ? readonly : tplComplie(readonly, { record });
    readonlyProps = readonly_result
      ? { addable: false, editable: false, deleteable: false, checkEnable: false }
      : { addable: true, editable: true, deleteable: true, checkEnable: true };
    //console.log('readonlyProps is', readonly_result, readonlyProps, readonly, record);
  }
  const post_key = getFromObject(record, fieldProps.local_key);
  //console.log('getBread', fieldProps.path);
  const { initialState } = useModel('@@initialState');
  if (fieldProps.path || menu_page_id) {
    const bread = fieldProps.path
      ? getBread(fieldProps.path, initialState?.currentUser)
      : getMenuDataById(initialState?.currentUser?.menuData, menu_page_id);
    //console.log('fieldProps.props is', JSON.stringify(fieldProps.props), bread);
    if (bread) {
      const { data: v_data } = bread;
      fieldProps.props = {
        ...fieldProps.props,
        ...v_data,
        ...readonlyProps,
        //paramExtra: { [fieldProps.foreign_key]: post_key },
        //postExtra: { [fieldProps.foreign_key]: post_key ? post_key : 0 },//这里去掉了table种的form提交数据后提交的参数，应该在请求form后重新将参数返回后放入到一个hidden元素中
        pageMenu: bread,
      };
      //log('saformtabolex', v);
    }
  }

  if (fieldProps.foreign_key) {
    fieldProps.props.paramExtra = {
      ...fieldProps.props.paramExtra,
      [fieldProps.foreign_key]: post_key ? post_key : 0,
    };
  }

  //以下是点击table的checkbox后需要将里面的toolbar栏展示到外面 直接用usestate后会报错，使用和buttonDrawer中参考drawerForm组件一样的设置
  const footerRef = useRef<HTMLDivElement | null>(null);
  const [, forceUpdate] = useState([]);
  const footerDomRef: React.RefCallback<HTMLDivElement> = useCallback((element) => {
    if (footerRef.current === null && element) {
      forceUpdate([]);
    }
    footerRef.current = element;
  }, []);
  const contentRenderInner = useCallback((items, submitter: any) => {
    return (
      <>
        {items}
        {footerRef.current && submitter ? (
          <React.Fragment key="submitter">
            {createPortal(
              <div style={{ padding: '8px 16px' }}>{submitter}</div>,
              footerRef.current,
            )}
          </React.Fragment>
        ) : (
          submitter
        )}
      </>
    );
  }, []);
  //console.log('alwaysenable', props, alwaysenable, post_key);
  return (
    <>
      <SaTable
        pageType={type == 'modal' ? 'modal' : 'drawer'}
        openType="drawer"
        name={fieldProps.name}
        tableTitle={fieldProps.name}
        selectRowRender={(dom) => {
          if (contentRender) {
            return contentRender(null, dom);
          } else {
            return contentRenderInner(null, dom);
          }
        }}
        {...fieldProps.props}
        tableProps={{
          size: 'small',
          className: 'sa-modal-table sa-form-table',
          cardBordered: true,
          scroll:scrollHeight ? { y: scrollHeight } : undefined,
        }}
        //readonly={readonly}
      />
      {type == 'page' ? (
        <div
          ref={footerDomRef}
          style={{
            padding: '0 24px',
          }}
        />
      ) : null}
    </>
  );
};

export default TableFromBread;
