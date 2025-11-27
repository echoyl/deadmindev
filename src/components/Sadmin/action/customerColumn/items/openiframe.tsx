import { Flex, Modal, Spin } from 'antd';
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
  const [loading, setLoading] = React.useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const IframeModal = (
    <Modal
      title={title}
      open={isModalOpen}
      footer={null}
      width={width}
      onCancel={() => {
        setIsModalOpen(false);
        setLoading(false);
      }}
      destroyOnHidden={true}
    >
      {loading && (
        <Flex align="center" justify="center">
          <Spin />
        </Flex>
      )}
      <iframe
        onLoad={() => {
          setLoading(false);
        }}
        src={src}
        width={width - 48}
        height={height}
        style={{ border: 'none' }}
      />
    </Modal>
  );
  const open = () => {
    setIsModalOpen(true);
    setLoading(true);
  };

  const triggerDom = trigger
    ? React.cloneElement(trigger, {
        key: 'trigger',
        ...trigger.props,
        onClick: open,
      })
    : null;

  return (
    <>
      {triggerDom}
      {IframeModal}
    </>
  );
};

export default OpenIframe;
