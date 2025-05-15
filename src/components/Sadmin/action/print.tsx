import request from '@/components/Sadmin/lib/request';
import { App, Button, ButtonProps, Modal, Spin } from 'antd';
import { FC, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { uid } from '../helpers';
import { SaContext } from '../posts/table';
import { SaDevContext } from '../dev';
interface actionConfirm {
  btn?: ButtonProps;
  url?: string;
  data?: {};
  dataId?: number;
  callback?: (value: any) => void;
  trigger?: (value: any) => ReactNode;
  title?: string;
  record?: { [key: string]: any };
  width?: string | number;
  callbackUrl?: string; //点击打印后的请求链接地址 （直接传入url后会请求，callback的简写吧）
}

const Print: FC<actionConfirm> = (props) => {
  const [open, setOpen] = useState(false);
  const [inner, setInner] = useState();
  const [loading, setLoading] = useState(true);
  const { actionRef } = useContext(SaContext);
  const {
    btn = { title: '操作', type: 'primary', danger: false },
    url = '',
    data,
    record,
    dataId,
    trigger,
    title = '打印',
    width = 1200,
    callbackUrl = '',
  } = props;
  const click = () => {
    setOpen(true);
  };
  const { messageApi, notificationApi } = useContext(SaDevContext);
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      //console.log('init print ', props);
      const ret = await request.post(url, {
        data: { ...data, id: dataId },
        then: ({ code, msg }) => {
          return;
        },
      });
      setLoading(false);
      if (!ret.code) {
        setInner(ret.data.html);
      } else {
        messageApi?.error(ret.msg);
        //关闭modal
        setOpen(false);
      }
    };
    if (open) {
      init();
    }
  }, [open]);

  const dom = trigger ? (
    <>{trigger(click)}</>
  ) : (
    <Button size="small" onClick={click} type={btn.type} danger={btn.danger}>
      {btn.title}
    </Button>
  );

  const id = uid();

  const contentRef = useRef(null);
  const handlePrint = useReactToPrint({
    contentRef,
    onBeforePrint: async () => {
      messageApi?.loading('加载打印内容中...', 0);
    },
    onAfterPrint: () => {
      messageApi?.destroy();
      if (callbackUrl) {
        //请求url
        request.post(callbackUrl, {
          data: { ...data, id: dataId, callback: 1 },
          then: ({ code, msg }) => {
            if (code) {
              notificationApi?.error({
                description: msg,
                message: '提示',
              });
            } else {
              actionRef?.current?.reload();
            }

            return;
          },
        });
      }
      setOpen(false);
    },
  });
  return (
    <>
      {dom}
      <Modal
        open={open}
        onOk={() => {
          handlePrint();
        }}
        onCancel={() => {
          setOpen(false);
        }}
        styles={{
          body: { maxHeight: 700, overflowY: 'auto' },
        }}
        width={width}
        title={title}
        okText="打印"
        centered={true}
      >
        <Spin spinning={loading}>
          <div
            id={id}
            style={{ minHeight: 200 }}
            ref={contentRef}
            dangerouslySetInnerHTML={{ __html: inner }}
          ></div>
        </Spin>
      </Modal>
    </>
  );
};

export default Print;
