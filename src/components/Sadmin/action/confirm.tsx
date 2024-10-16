import request from '@/components/Sadmin/lib/request';
import { Button, ButtonProps, Modal } from 'antd';
import React, { FC, ReactElement, useContext, useMemo } from 'react';
import { SaContext } from '../posts/table';
import cache from '../helper/cache';
import { SaDevContext } from '../dev';
import { MessageInstance } from 'antd/es/message/interface';
import { tplComplie } from '../helpers';
import { isArr } from '../checkers';

interface actionConfirm {
  msg?: string | React.ReactNode;
  btn?: ButtonProps;
  method?: 'post' | 'delete' | 'get';
  url?: string;
  data?: {};
  dataId?: number;
  callback?: (value: any) => void;
  //trigger?: (value: any) => ReactNode;
  trigger?: JSX.Element | boolean;
  title?: string;
  afterActionType?: 'reload' | 'goback' | 'none';
  record?: Record<string, any>;
}

export const ConfirmTriggerClick = (props: actionConfirm, actionRef, searchFormRef?: any) => {
  const {
    msg,
    method = 'post',
    url = '',
    data = {},
    record,
    dataId = 0,
    callback,
    title,
    afterActionType = 'reload',
  } = props;
  const values = searchFormRef?.current?.getFieldsFormatValue();
  const newData: Record<string, any> = {};
  Object.keys(data).map((k) => {
    const tplc = tplComplie(data[k], { record });
    newData[k] = tplc ? tplc : '';
  });
  return {
    title: title ? title : '温馨提示！',
    content: msg,
    onOk: async () => {
      const pdata =
        method == 'get'
          ? { ...newData, id: dataId, ...values }
          : { ...newData, id: dataId, ...values };
      //如果是get请求 检测values是数组的话修改name
      if (method == 'get') {
        Object.keys(pdata).map((k) => {
          if (isArr(pdata[k])) {
            pdata[k + '[]'] = pdata[k];
            delete pdata[k];
          }
        });
      }
      const requestProps =
        method == 'get'
          ? { params: pdata }
          : {
              data: pdata,
            };
      const ret = await request[method](url, { ...requestProps, drawer: true });
      if (callback) {
        const cbret = callback(ret);
        if (cbret == true) {
          //自定义回调返回true 后 阻断后续操作
          return;
        }
      }
      if (!ret) {
        return;
      }
      //加入默认的回调动作
      if (!ret.code) {
        //后台传值后 支持 1.本地storage信息写入 2.页面是否跳转
        if (ret.data?.setStorage) {
          for (let name in ret.data.setStorage) {
            cache.set(name, ret.data.setStorage[name]);
          }
        }
        if (ret.data?.redirect) {
          window.open(ret.data.redirect.url, ret.data.redirect.type);
        } else {
          //不跳转链接就刷新页面
          if (actionRef?.current && afterActionType == 'reload') {
            actionRef.current?.reload();
          } else {
            if (afterActionType == 'goback') {
              history.back();
            }
          }
        }
      }
      // if (!ret.code) {
      //   actionRef.current?.reload();
      //   setSelectedRows([]);
      //   setSelectedRowKeys([]);
      // }
    },
  };
};

const Confirm: FC<actionConfirm> = (props) => {
  const { btn = { title: '操作', type: 'primary', danger: false }, trigger } = props;
  const { modalApi } = useContext(SaDevContext);
  const { actionRef, searchFormRef } = useContext(SaContext);
  const onClick = (e?: any) => {
    modalApi?.confirm(ConfirmTriggerClick(props, actionRef, searchFormRef));
  };
  const triggerDom: JSX.Element | null = useMemo(() => {
    if (!trigger) {
      return null;
    }

    //onClick();
    const newDom = React.cloneElement(trigger as ReactElement, {
      key: 'trigger',
      onClick: (e: any) => {
        onClick(e);
        trigger?.props?.onClick?.(e);
      },
    });
    return newDom;
  }, [trigger]);

  return (
    <>
      {trigger ? (
        triggerDom
      ) : (
        <Button size="small" onClick={onClick} type={btn.type} danger={btn.danger}>
          {btn.title}
        </Button>
      )}
    </>
  );
};
// export const ConfirmConfig:FC = (props) => {
//   return
// }

export const ConfirmRender = (text, props) => {
  //console.log('confirm props', props.fieldProps, text);
  return <Confirm {...props.fieldProps} dataId={props.record.id} />;
};

export default Confirm;
