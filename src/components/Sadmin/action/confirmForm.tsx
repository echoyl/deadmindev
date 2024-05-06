import { ProFormInstance } from '@ant-design/pro-components';
import { Button, ButtonProps } from 'antd';
import { FC, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { history } from 'umi';
import { getBread, saFormColumnsType, saFormTabColumnsType, tplComplie } from '../helpers';
import { SaForm, saFormProps } from '../posts/post';
import { SaContext } from '../posts/table';
import ButtonModal from './buttonModal';

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
  onChange?: (value: any) => void;
  value?: any;
  trigger?: ReactNode;
  width?: number;
  page?: string;
  readonly?: boolean;
  xkey?: string;
  saFormProps?: saFormProps;
  open?: boolean;
  onOpen?: (open: boolean) => void;
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
  } = props;
  const formRef = useRef<ProFormInstance>();
  const { actionRef, formRef: topFormRef } = useContext(SaContext);

  let tabs = [];
  let url = ourl;
  let setting = {};
  let pageMenu = {};
  let editable = true;
  if (page) {
    const bread = getBread(page);
    if (bread) {
      tabs = bread?.data.tabs;
      url = bread?.data.postUrl ? bread?.data.postUrl : bread?.data.url + '/show';
      //console.log('bread', bread);
      setting = bread?.data.setting;
      pageMenu = bread;
      editable = bread?.data.editable ? bread?.data.editable : false;
    }
  } else {
    tabs = utabs ? utabs : [{ title: '基础信息', formColumns: [...formColumns] }];
  }

  return (
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
      showTabs={tabs?.length <= 1 ? false : true}
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
                      <Button key="rest" type="default" onClick={() => setOpen?.(false)}>
                        关闭
                      </Button>,
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
            //console.log('列表刷新 及关闭弹层');
            //console.log('confirm form has actionRef', actionRef);
            if (actionRef) {
              //在列表中 刷新列表
              //console.log('列表 reload');
              //actionRef.current?.reload();
              //设置弹出层关闭，本来会触发table重新加载数据后会关闭弹层，但是如果数据重载过慢的话，这个会感觉很卡所以在这里直接设置弹层关闭
              setOpen(false);
              callback?.(ret);
            } else if (topFormRef) {
              //console.log('in deep form and close this one');
              setOpen(false);
              callback?.(ret);
            } else {
              //在表单 中  就返回上一页
              setOpen(false);
              const rcb = callback?.(ret);
              if (!rcb) {
                history.back();
              }
            }
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
    page,
    onChange,
    readonly = false,
    xkey,
    saFormProps = {},
    open: oopen = false,
    onOpen,
  } = props;
  //console.log('ConfirmForm props ', props);
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

  return (
    <ButtonModal
      trigger={trigger ? trigger : <Button {..._btn}>{_btn.title}</Button>}
      open={open}
      width={width}
      title={msg}
      afterOpenChange={(open) => {
        setOpen(open);
        onOpen?.(open);
      }}
    >
      <InnerForm
        url={url}
        postUrl={postUrl}
        formColumns={formColumns}
        tabs={tabs}
        page={page}
        callback={callback}
        value={props.value}
        data={data}
        dataid={dataId}
        onChange={onChange}
        readonly={readonly}
        saFormProps={saFormProps}
      />
    </ButtonModal>
  );
};

export const ConfirmFormRender = (props) => {
  let show = true;
  if (props.if) {
    show = tplComplie(props.if, props);
  }
  return show ? <ConfirmForm dataId={props.record?.id} {...props} /> : null;
};

export default ConfirmForm;
