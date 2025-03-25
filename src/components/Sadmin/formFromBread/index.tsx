import { FC, useContext } from 'react';
import { isBool, isUndefined } from '../checkers';
import { getBread, getMenuDataById, tplComplie } from '../helpers';
import { SaForm } from '../posts/post';
import { SaContext } from '../posts/table';
import { useModel } from '@umijs/max';

const FormFromBread: FC<{
  fieldProps?: any;
  record?: any;
  readonly?: string | boolean; //支持条件判断
  currentRow?: { [key: string]: any };
  contentRender?: any;
  menu_page_id?: number; //引用已有菜单的id
}> = (props) => {
  const {
    fieldProps = { props: {} },
    record,
    readonly,
    currentRow,
    contentRender,
    menu_page_id,
  } = props;
  const readonly_result = isBool(readonly)
    ? readonly
    : isUndefined(readonly)
      ? true
      : tplComplie(readonly, { record });
  const readonlyProps = readonly_result
    ? { addable: false, editable: false, deleteable: false, checkEnable: false }
    : { addable: true, editable: true, deleteable: true, checkEnable: true };
  const { initialState } = useModel('@@initialState');
  if (fieldProps.path || menu_page_id) {
    const bread = fieldProps.path
      ? getBread(fieldProps.path, initialState?.currentUser)
      : getMenuDataById(initialState?.currentUser?.menuData, menu_page_id);
    if (bread) {
      const { data: v_data } = bread;
      //如果有path的bread的话 读取菜单的设置
      const _readonlyProps = !isUndefined(readonly)
        ? readonlyProps
        : {
            addable: v_data.addable,
            editable: v_data.editable,
            deleteable: v_data.deleteable,
            checkEnable: v_data.deleteable,
          };
      //处理url
      const url =
        (v_data.postUrl ? v_data.postUrl : v_data.url + '/show') +
        (currentRow?.id ? '?id=' + currentRow?.id : '');
      fieldProps.props = {
        ...fieldProps.props,
        ...v_data,
        ..._readonlyProps,
        url,
        formProps: { ...fieldProps.props?.formProps, contentRender },
        pageMenu: bread,
        //paramExtra: { [fieldProps.foreign_key]: record[fieldProps.local_key] },
      };
      //log('saformtabolex', v);
      //console.log('SaForm props', fieldProps);
    }
  }
  return <SaForm {...fieldProps.props} showTabs={false} align="left" pageType="drawer" />;
};
export const formFromBreadRender = (text, props) => {
  //console.log('saFormTable here', props);
  const { fieldProps } = props;
  const { formRef } = useContext(SaContext);
  //在form中渲染 必须是readonly 所以用formRef 获取当前表单的所有值
  const formValue = formRef.current?.getFieldsValue(true);

  return (
    <FormFromBread
      fieldProps={{ ...fieldProps, props: { tableProps: { search: false } } }}
      record={formValue}
      readonly={fieldProps.readonly}
    />
  );
};
export default FormFromBread;
