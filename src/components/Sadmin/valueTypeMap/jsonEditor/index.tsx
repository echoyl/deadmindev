import { lazy, Suspense } from 'react';
import { Spin } from 'antd';

const LazyMonacoEditor = lazy(() =>
  import('./inner').then((m) => ({ default: m.MonacoEditor })),
);

const LazyJsonEditor = lazy(() => import('./inner'));

function suspend(Component) {
  return function SuspenseWrapper(props) {
    return (
      <Suspense
        fallback={
          <div
            style={{
              height: props.height || 400,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Spin />
          </div>
        }
      >
        <Component {...props} />
      </Suspense>
    );
  };
}

export const MonacoEditor = suspend(LazyMonacoEditor);
export default suspend(LazyJsonEditor);
