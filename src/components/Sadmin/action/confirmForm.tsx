import { ProFormInstance } from '@ant-design/pro-components';
import { Button, ButtonProps, Drawer, GetProps, Modal } from 'antd';
import { FC, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { history } from 'umi';
import { useModel } from '@umijs/max';
import { getBread, saFormColumnsType, saFormTabColumnsType, t } from '../helpers';
import { SaForm, saFormProps } from '../posts/post';
import { SaContext } from '../posts/table';
import ButtonModal from './buttonModal';
import ButtonDrawer from './buttonDrawer';
import Loading from '@/components/Loading';

interface actionConfirm {
  msg?: string;
  btn?: ButtonProps;
  method?: 'post' | 'delete';
  url?: string;
  postUrl?: string;
  data?: {};
  dataId?: number;
  formColumns?: saFormColumnsType;
  tabs?: saFormTabColumnsType;
  callback?: (value: any) => void;
  afterActionType?: 'reload' | 'goback' | 'none';
  onChange?: (value: any) => void;
  value?: any;
  initValue?: (value: any) => any;
  trigger?: ReactNode | JSX.Element;
  width?: number;
  height?: number;
  page?: string;
  readonly?: boolean;
  xkey?: string;
  saFormProps?: saFormProps;
  open?: boolean;
  onOpen?: (open: boolean) => void;
  closable?: boolean;
  modalProps?: GetProps<typeof Modal>;
  drawerProps?: GetProps<typeof Drawer>;
  showType?: 'modal' | 'drawer';
}

const InnerForm = (props) => {
  const {
    setOpen,
    contentRender,
    formColumns,
    tabs: utabs,
    url: ourl,
    postUrl,
    callback,
    value,
    dataid,
    data,
    onChange,
    page,
    readonly = false,
    saFormProps,
    afterActionType = 'reload',
    closable = true,
  } = props;
  const formRef = useRef<ProFormInstance>();
  const { actionRef, formRef: topFormRef } = useContext(SaContext);
  //console.log('innner form value', value, formColumns);
  const [url, setUrl] = useState<string>(ourl);
  const [tabs, setTabs] = useState<any[]>([]);
  const [setting, setSetting] = useState<Record<string, any>>({});
  const [pageMenu, setPageMenu] = useState<Record<string, any>>({});
  const [editable, setEditable] = useState<boolean>(true);
  const { initialState } = useModel('@@initialState');
  const [formOpen, setFormOpen] = useState<boolean>(false);
  useEffect(() => {
    if (page) {
      const bread = getBread(page, initialState?.currentUser);
      if (bread) {
        setTabs(bread?.data.tabs);
        setUrl(bread?.data.postUrl ? bread?.data.postUrl : bread?.data.url + '/show');
        setSetting(bread?.data.setting);
        setPageMenu(bread);
        setEditable(bread?.data.editable ? bread?.data.editable : false);
      }
    } else {
      console.log('formColumns', formColumns);
      setTabs(
        utabs ? utabs : [{ title: '基础信息', formColumns: formColumns ? [...formColumns] : [] }],
      );
    }
    setFormOpen(true);
  }, [page, utabs]);

  const afterAction = (ret: any) => {
    setOpen(false);
    const rcb = callback?.(ret);
    if (callback) {
      if (actionRef || topFormRef) {
        return;
      }
    }

    if (actionRef || topFormRef) {
      if (afterActionType == 'reload') {
        actionRef.current?.reload();
      }
    } else {
      if (!rcb) {
        history.back();
      } else {
        if (afterActionType == 'goback') {
          history.back();
        }
      }
    }

    return;
  };

  return formOpen ? (
    <SaForm
      {...saFormProps}
      pageMenu={pageMenu}
      tabs={tabs}
      setting={setting}
      beforeGet={(data) => {
        if (!data) {
          //没有data自动关闭弹出层
          setOpen?.(false);
        }
      }}
      formRef={formRef}
      actionRef={actionRef}
      postExtra={{ id: dataid, ...data }}
      paramExtra={{ id: dataid }}
      // showTabs={tabs?.length <= 1 ? false : true}
      formProps={{
        contentRender,
        initialValues: value,
        submitter: editable
          ? {
              searchConfig: {
                resetText: '关闭',
                submitText: url ? '提交' : '确定',
              },
              render: (props, doms) => {
                return readonly
                  ? null
                  : [
                      closable ? (
                        <Button key="rest" type="default" onClick={() => setOpen?.(false)}>
                          {t('cancel')}
                        </Button>
                      ) : null,
                      doms[1],
                    ];
              },
            }
          : false,
      }}
      url={url}
      postUrl={postUrl}
      align="left"
      pageType="drawer"
      msgcls={(ret) => {
        //setOpen(false);
        //console.log('finish', ret);
        const { code, data } = ret;
        if (url || postUrl) {
          //有url提交
          if (!code) {
            afterAction(ret);
          } else {
            return;
          }
        } else {
          //无 绑定onchange事件
          //console.log('close it', data);
          setOpen(false);
          onChange?.(data);
        }
      }}
    />
  ) : (
    <Loading />
  );
};

const ConfirmForm: FC<actionConfirm> = (props) => {
  const {
    msg = '配置信息',
    btn,
    method = 'post',
    url = '',
    postUrl,
    data = {},
    dataId = 0,
    callback,
    formColumns,
    tabs,
    trigger,
    width = 800,
    height = 450,
    page,
    onChange,
    readonly = false,
    xkey,
    saFormProps = {},
    open: oopen = false,
    onOpen,
    modalProps,
    drawerProps,
    closable = true,
    afterActionType = 'reload',
    showType = 'modal',
    initValue = (v) => v,
  } = props;
  const defaultButton = { title: '操作', type: 'primary', danger: false, size: 'small' };
  const _btn = { ...defaultButton, ...btn };

  //const [form] = Form.useForm<{ desc: string }>();
  const [open, setOpen] = useState(oopen);
  // useEffect(() => {
  //   console.log('confirm modal open state is ', open, page, xkey);
  // }, [open]);
  useEffect(() => {
    setOpen(oopen);
  }, [oopen]);
  const inner = (
    <InnerForm
      url={url}
      postUrl={postUrl}
      formColumns={formColumns}
      tabs={tabs}
      page={page}
      callback={callback}
      value={initValue(props.value)}
      data={data}
      dataid={dataId}
      onChange={onChange}
      readonly={readonly}
      saFormProps={saFormProps}
      closable={closable}
      afterActionType={afterActionType}
    />
  );
  //console.log('inner form ', inner);

  return showType == 'modal' ? (
    <ButtonModal
      trigger={trigger ? trigger : <Button {..._btn}>{_btn.title}</Button>}
      open={open}
      width={width}
      title={msg}
      afterOpenChange={(open) => {
        setOpen(open);
        onOpen?.(open);
      }}
      modalProps={modalProps}
      minHeight={height}
    >
      {inner}
    </ButtonModal>
  ) : (
    <ButtonDrawer
      trigger={trigger ? trigger : <Button {..._btn}>{_btn.title}</Button>}
      open={open}
      width={width}
      title={msg}
      afterOpenChange={(open) => {
        setOpen(open);
        onOpen?.(open);
      }}
      drawerProps={drawerProps}
    >
      {inner}
    </ButtonDrawer>
  );
};

export default ConfirmForm;
