import { Flex, Spin } from 'antd';
export default ({ height = '100vh' }) => {
  return (
    <div style={{ flex: '1', height }}>
      <Flex align="center" justify="center" style={{ height: '100%' }}>
        <Spin size="default" />
      </Flex>
    </div>
  );
};
