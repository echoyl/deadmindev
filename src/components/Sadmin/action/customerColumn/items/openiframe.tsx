import { modal } from '@/components/Sadmin/message';
import React from 'react';

interface Props {
  title?: string;
  trigger?: JSX.Element;
  width?: number;
  height?: number;
  src?: string;
}

const OpenIframe: React.FC<Props> = (props) => {
  const { trigger, title = '详情', width = 1000, height = 700, src } = props;

  const open = () => {
    modal.info({
      title: title,
      width: width, //两边padding48px
      content: (
        <>
          <iframe src={src} width={width - 48} height={height} style={{ border: 'none' }} />
        </>
      ),
      okText: null,
      icon: null,
      footer: null,
      closable: true,
    });
  };

  const triggerDom = trigger
    ? React.cloneElement(trigger, {
        key: 'trigger',
        ...trigger.props,
        onClick: open,
      })
    : null;

  return <>{triggerDom}</>;
};

export default OpenIframe;
