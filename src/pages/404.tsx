import Loading from '@/components/Loading';
import { lazy, Suspense } from 'react';

const Page = lazy(() => import('@/components/Sadmin/404'));

export default () => {
  return (
    <Suspense fallback={<Loading />}>
      <Page />
    </Suspense>
  );
};
