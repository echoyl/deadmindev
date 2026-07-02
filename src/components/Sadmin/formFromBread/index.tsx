import { useModel } from '@umijs/max';
import type { FC } from 'react';
import { useContext } from 'react';
import { SaPageContext, usePageMenu } from '../404';
import { isBool, isUndefined } from '../checkers';
import { getBread, getMenuDataById, tplComplie } from '../helpers';
import { SaForm } from '../posts/post';
import { SaContext } from '../posts/table';

const FormFromBread: FC<{
  fieldProps?: any;
  record?: any;
  readonly?: string | boolean; //支持条件判断
  currentRow?: Record<string, any>;
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
  const { pageMenu: topPageMenu } = useContext(SaPageContext);

  let bread = null;
  if (fieldProps.path || menu_page_id) {
    bread = fieldProps.path
      ? getBread(fieldProps.path, initialState?.currentUser)
      : getMenuDataById(initialState?.currentUser?.menuData, menu_page_id);
    if (bread) {
      const { data: v_data } = bread;
      const _readonlyProps = !isUndefined(readonly)
        ? readonlyProps
        : {
            addable: v_data.addable,
            editable: v_data.editable,
            deleteable: v_data.deleteable,
            checkEnable: v_data.deleteable,
          };
      const url =
        (v_data.postUrl ? v_data.postUrl : v_data.url + '/show') +
        (currentRow?.id ? '?id=' + currentRow?.id : '');
      fieldProps.props = {
        ...fieldProps.props,
        ...v_data,
        ..._readonlyProps,
        url,
        formProps: { ...fieldProps.props?.formProps, contentRender },
      };
    }
  }

  const effectiveMenu = bread || topPageMenu;
  const [pageMenu, setPageMenu] = usePageMenu(effectiveMenu);

  return (
    <SaPageContext value={{ pageMenu, setPageMenu }}>
      <SaForm {...fieldProps.props} showTabs={false} align="left" pageType="drawer" />
    </SaPageContext>
  );
};
export const FormFromBreadRender = (text, props) => {
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
