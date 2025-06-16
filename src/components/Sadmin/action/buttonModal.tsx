import { Modal, ModalProps } from 'antd';
import React, { FC, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
interface actionConfirm {
  trigger?: ReactNode | JSX.Element;
  title?: string;
  open?: boolean;
  onOk?: () => boolean | void;
  width?: number;
  height?: number; //modal的最大高度
  minHeight?: number; //modal的最小高度
  modalProps?: ModalProps;
  children?: ReactNode;
  confirmLoading?: boolean;
  afterOpenChange?: (open: boolean) => void;
  formFooter?: boolean; //是否使用 form的底部 设置false的话 使用自带的footer设置
  readonly?: boolean;
}

const ButtonModal: FC<actionConfirm> = (props) => {
  //const [open, setOpen] = useState(false);
  const {
    trigger,
    title = '信息',
    open = false,
    onOk,
    width = 1200,
    height = 650,
    minHeight = 0,
    modalProps,
    afterOpenChange,
    confirmLoading = false,
    formFooter = true,
    readonly = false,
  } = props;
  const [iopen, setOpen] = useState(open);
  //下面这段参考 drawerForm组件
  const footerRef = useRef<HTMLDivElement | null>(null);
  const [, forceUpdate] = useState([]);
  const footerDomRef: React.RefCallback<HTMLDivElement> = useCallback((element) => {
    if (footerRef.current === null && element) {
      forceUpdate([]);
    }
    footerRef.current = element;
  }, []);
  const contentRender = useCallback((items, submitter: any) => {
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

  const triggerDom = useMemo(() => {
    if (!trigger) {
      return null;
    }

    return React.cloneElement(trigger, {
      key: 'trigger',
      ...trigger.props,
      onClick: async (e: any) => {
        setOpen(!iopen);
        trigger.props?.onClick?.(e);
      },
    });
  }, [setOpen, trigger, iopen]);

  useEffect(() => {
    setOpen(open);
  }, [open]);

  useEffect(() => {
    afterOpenChange?.(iopen);
  }, [iopen]);

  const close = () => {
    setOpen(false);
  };
  return (
    <>
      {triggerDom}
      <Modal
        open={iopen}
        onOk={async () => {
          if (onOk) {
            if (onOk()) {
              close();
            }
          } else {
            close();
          }
        }}
        onCancel={() => {
          close();
        }}
        width={width}
        title={title}
        {...modalProps}
        centered={true}
        destroyOnClose={true}
        confirmLoading={confirmLoading}
        footer={
          readonly
            ? null
            : (originNode) => {
                //console.log(params);
                if (formFooter) {
                  return (
                    <div
                      ref={footerDomRef}
                      style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                      }}
                    />
                  );
                } else {
                  return originNode;
                }
              }
        }
        maskClosable={false}
        styles={{
          body: {
            maxHeight: height,
            minHeight,
            overflowY: 'auto',
            overflowX: 'hidden',
          },
          ...modalProps?.styles,
        }}
      >
        <div
          onKeyDown={(e) => {
            e.stopPropagation();
          }}
        >
          {iopen &&
            React.Children.map(props.children, (c) => {
              return React.cloneElement(c, { setOpen, contentRender });
            })}
        </div>
      </Modal>
    </>
  );
};
// export const ConfirmConfig:FC = (props) => {
//   return
// }

export default ButtonModal;
