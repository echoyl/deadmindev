import { Drawer, DrawerProps } from 'antd';
import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface actionConfirm {
  trigger?: JSX.Element;
  title?: string;
  open?: boolean;
  width?: number;
  drawerProps?: DrawerProps;
  children?: React.ReactNode;
  afterOpenChange?: (open: boolean) => void;
}

const ButtonDrawer: FC<actionConfirm> = (props) => {
  //const [open, setOpen] = useState(false);
  const {
    trigger,
    title = '弹层',
    open = false,
    width = 800,
    drawerProps = {},
    afterOpenChange,
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
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  padding: '8px 16px',
                  borderTop: '1px solid rgba(5, 5, 5, 0.06)',
                }}
              >
                <div style={{ padding: '8px 16px' }}>{submitter}</div>
              </div>,
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
        trigger.props?.onClick?.(e);
        setOpen(!iopen);
      },
    });
  }, [setOpen, trigger, iopen]);

  useEffect(() => {
    setOpen(open);
  }, [open]);

  useEffect(() => {
    afterOpenChange?.(iopen);
  }, [iopen]);

  // if (drawerProps && !drawerProps.footer) {
  //   //有自定义footer
  //   drawerProps.styles = {
  //     footer: { padding: 0 },
  //   };
  // }

  // if (drawerProps && !drawerProps.footerStyle) {
  //   //有自定义footer
  //   drawerProps.styles = {
  //     footer: drawerProps.footerStyle,
  //   };
  // }

  return (
    <>
      {triggerDom}
      <Drawer
        open={iopen}
        onClose={() => {
          //onOk?.();
          setOpen(false);
        }}
        width={width}
        title={title}
        footer={<div ref={footerDomRef} />}
        maskClosable={false}
        {...drawerProps}
        styles={{
          footer: {
            padding: 0,
            border: 'none',
          },
          ...drawerProps?.styles,
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
      </Drawer>
    </>
  );
};
export default ButtonDrawer;
