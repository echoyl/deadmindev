import { useContext, useState, lazy, Suspense, useEffect, useRef } from 'react';
import LoadingFullHeight from '@/components/LoadingFullHeight';
import { SaDevContext } from '../../dev';
import { isObj } from '../../checkers';
import { loader } from '@monaco-editor/react';

const Editor = lazy(() => import('@monaco-editor/react'));

export const MonacoDefaultOptions = {
  selectOnLineNumbers: false,
  automaticLayout: true,
  minimap: {
    enabled: false,
  },
  autoIndent: true,
  scrollbar: {
    verticalScrollbarSize: 6,
    horizontalScrollbarSize: 6,
  },
};

export const MonacoEditor = (props) => {
  useEffect(() => {
    loader.config({
      paths: {
        vs: 'https://cdn.jsdmirror.com/npm/monaco-editor@0.52.2/min/vs',
      },
    });
  }, []);

  const { options, height = 400, ...restProps } = props;
  const realOptions = { ...MonacoDefaultOptions, ...options };
  const { setting } = useContext(SaDevContext);

  return (
    <Suspense fallback={<LoadingFullHeight />}>
      <Editor
        options={realOptions}
        height={height}
        theme={setting?.navTheme != 'light' ? 'vs-dark' : 'vs'}
        //theme="vs-dark"
        language="json"
        className="monaco-editor-container"
        {...restProps}
      />
    </Suspense>
  );
};

const JsonEditor = (props) => {
  const { value = '', onChange, height = 400, readOnly } = props;
  const options = { readOnly };

  const [content, setContent] = useState(
    value && isObj(value) ? JSON.stringify(value, null, 2) : value,
  );

  useEffect(() => {
    if (readOnly && isObj(value)) {
      //当只读模式下根据外面的值来更新数据
      setContent(JSON.stringify(value, null, 2));
    }
  }, [value]);

  const onChangeR = (e) => {
    setContent(e);
    try {
      const inputValue = e ? JSON.parse(e) : '';
      onChange?.(inputValue);
    } catch (e) {
      //console.log(e);
    }

    //console.log('inputValue',inputValue);
  };

  return <MonacoEditor options={options} height={height} value={content} onChange={onChangeR} />;
};

export default JsonEditor;
