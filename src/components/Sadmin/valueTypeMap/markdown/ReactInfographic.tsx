import { Spin } from 'antd';
import React from 'react';
type ReactInfographicProps = {
  children: React.ReactNode;
};

/**
 * React wrapper for @antv/infographic
 * Dynamically imports the library to avoid SSR issues
 */
function ReactInfographic(props: ReactInfographicProps) {
  const { children } = props;
  const [isClient, setIsClient] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const infographicInstance = React.useRef<{
    render: (spec: string) => void;
    destroy: () => void;
  } | null>(null);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  React.useEffect(() => {
    if (!isClient || !containerRef.current) return;

    let isMounted = true;

    import('@antv/infographic')
      .then(({ Infographic }) => {
        if (!isMounted || !containerRef.current) return;

        infographicInstance.current = new Infographic({
          container: containerRef.current,
        });

        infographicInstance.current.render(children as string);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Failed to load infographic:', error);
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
      infographicInstance.current?.destroy();
      infographicInstance.current = null;
    };
  }, [isClient, children]);

  if (!isClient) {
    return (
      <div
        style={{
          minHeight: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Spin description="Loading infographic..." />
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.8)',
            zIndex: 1,
          }}
        >
          <Spin description="Rendering..." />
        </div>
      )}
      <div ref={containerRef} />
    </>
  );
}

export default ReactInfographic;
