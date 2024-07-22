import { Button } from 'antd';
import { useContext } from 'react';
import ButtonDrawer from '../../action/buttonDrawer';
import ButtonModal from '../../action/buttonModal';
import { SaForm } from '../../posts/post';
import { SaContext, saTableProps } from '../../posts/table';
import { t, tplComplie } from '../../helpers';
import { useIntl } from '@umijs/max';

const InnerForm = (props) => {
  const {
    setOpen,
    contentRender,
    formColumns,
    url,
    currentRow,
    paramExtra,
    tabs,
    postExtra,
    addable,
    editable,
    afterFormPost,
  } = props;
  const { actionRef, formRef } = useContext(SaContext);
  return (
    <SaForm
      {...props}
      msgcls={(ret) => {
        const { code } = ret;
        if (!code) {
          //actionRef.current?.reload();
          afterFormPost?.(ret);
          //设置弹出层关闭，本来会触发table重新加载数据后会关闭弹层，但是如果数据重载过慢的话，这个会感觉很卡所以在这里直接设置弹层关闭
          setOpen(false);
          return;
        }
      }}
      beforeGet={(data) => {
        if (!data) {
          //没有data自动关闭弹出层
          setOpen?.(false);
        }
      }}
      formColumns={formColumns}
      tabs={tabs}
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
    afterFormPost?: any;
  },
) => {
  const {
    openType,
    createModalVisible,
    currentRow,
    handleModalVisible,
    name,
    openWidth = 860,
    formColumns,
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
        >
          <InnerForm
            {...props}
            formColumns={formColumns}
            url={url + '/show'}
            currentRow={currentRow}
            paramExtra={paramExtra}
            tabs={tabs}
            postExtra={postExtra}
            editable={editable}
            addable={addable}
          />
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
          drawerProps={{ styles: { body: { paddingTop: 0 } } }}
        >
          <InnerForm
            {...props}
            formColumns={formColumns}
            url={url + '/show'}
            currentRow={currentRow}
            paramExtra={paramExtra}
            tabs={tabs}
            postExtra={postExtra}
            editable={editable}
            addable={addable}
          />
        </ButtonDrawer>
      )}
    </>
  );
};
