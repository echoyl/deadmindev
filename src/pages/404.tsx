import { PageLoading } from '@ant-design/pro-components';
import { lazy, Suspense } from 'react';

const Page = lazy(() => import('@/components/Sadmin/404'));

export default () => {
  return (
    <Suspense fallback={<PageLoading />}>
      <Page />
    </Suspense>
  );
};
