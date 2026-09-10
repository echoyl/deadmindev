import { Skeleton } from 'antd';

const Loading: React.FC = () => (
  <Skeleton style={{ padding: '24px 16px', height: '60vh' }} active paragraph={{ rows: 8 }} />
);

export default Loading;
