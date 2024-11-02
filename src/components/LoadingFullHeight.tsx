import { Flex, Spin } from 'antd';
export default () => {
  return (
    <div style={{ flex: '1', height: '100vh' }}>
      <Flex align="center" justify="center" style={{ height: '100%' }}>
        <Spin size="default" />
      </Flex>
    </div>
  );
};
