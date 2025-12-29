import { useIntl, useModel } from '@umijs/max';
import { Button } from 'antd';
import { useContext } from 'react';
import ButtonDrawer from '../../action/buttonDrawer';
import ButtonModal from '../../action/buttonModal';
import { getMenuDataById, t, tplComplie } from '../../helpers';
import { SaForm } from '../../posts/post';
import type { saTableProps } from '../../posts/table';
import { SaContext } from '../../posts/table';

const InnerForm = (props: Record<string, any>) => {
  const {
    setOpen,
    contentRender,
    url,
    currentRow,
    paramExtra,
    postExtra,
    addable,
    editable,
    afterFormPost,
    pageMenu,
  } = props;
  const { actionRef, formRef } = useContext(SaContext);
  const { initialState } = useModel('@@initialState');
  const bread = getMenuDataById(initialState?.currentUser?.menuData, pageMenu?.id);
  return (
    <SaForm
      {...props}
      {...bread?.data}
      pageMenu={bread}
      msgcls={(ret) => {
        const { code } = ret;
        if (!code) {
          setOpen(false);
          //actionRef.current?.reload();
          afterFormPost?.(ret);
          //设置弹出层关闭，本来会触发table重新加载数据后会关闭弹层，但是如果数据重载过慢的话，这个会感觉很卡所以在这里直接设置弹层关闭
          return;
        }
      }}
      beforeGet={(data) => {
        if (!data) {
          //没有data自动关闭弹出层
          setOpen?.(false);
        }
      }}
      formRef={formRef}
      actionRef={actionRef}
      paramExtra={{ ...currentRow, ...paramExtra }}
      postExtra={{ ...currentRow, ...postExtra }}
      url={url}
      //showTabs={tabs?.length > 1 ? true : false}
      formProps={{
        contentRender,
        submitter:
          (!editable && currentRow.id) ||
          (currentRow.readonly && currentRow.id) ||
          (!currentRow.id && !addable)
            ? false
            : {
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
      align="left"
      dataId={currentRow.id}
      pageType="drawer"
    />
  );
};

export const TableForm = (
  props: saTableProps & {
    createModalVisible?: any;
    currentRow?: any;
    handleModalVisible?: any;
  },
) => {
  const {
    openType,
    createModalVisible,
    currentRow,
    handleModalVisible,
    name,
    openWidth = 860,
    url,
    paramExtra,
    tabs,
    postExtra,
    editable = true,
    addable = true,
    setting = {},
  } = props;
  const { formWidth } = setting;
  const intl = useIntl();
  const inner = (
    <InnerForm
      {...props}
      url={url + '/show'}
      currentRow={currentRow}
      paramExtra={paramExtra}
      tabs={tabs}
      postExtra={postExtra}
      editable={editable}
      addable={addable}
    />
  );
  return (
    <>
      {openType == 'modal' && (
        <ButtonModal
          open={createModalVisible}
          title={
            (currentRow.id
              ? currentRow.readonly
                ? t('view', intl)
                : t('edit', intl)
              : t('add', intl)) + (name ? ' - ' + tplComplie(name, { intl }) : '')
          }
          width={formWidth ? formWidth : openWidth}
          afterOpenChange={(open) => {
            handleModalVisible(open);
          }}
          minHeight={450}
        >
          {inner}
        </ButtonModal>
      )}
      {openType == 'drawer' && (
        <ButtonDrawer
          open={createModalVisible}
          title={
            (currentRow.id ? (currentRow.readonly ? '查看' : '编辑') : '新增') +
            (name ? ' - ' + name : '')
          }
          width={formWidth ? formWidth : openWidth}
          afterOpenChange={(open) => {
            handleModalVisible(open);
          }}
          drawerProps={{ styles: { body: { paddingTop: 8 } } }}
        >
          {inner}
        </ButtonDrawer>
      )}
    </>
  );
};
