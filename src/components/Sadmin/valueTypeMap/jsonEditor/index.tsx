import { useContext, useState, lazy, Suspense, useEffect, useRef } from 'react';
import LoadingFullHeight from '@/components/LoadingFullHeight';
import { SaDevContext } from '../../dev';
import { isObj } from '../../checkers';
import { loader } from '@monaco-editor/react';
import { Card, Typography } from 'antd';

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
        vs: 'https://cdn.jsdmirror.com/npm/monaco-editor@0.54.0/min/vs',
        //vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.54.0/min/vs',
      },
    });
  }, []);

  const { options, height = 400, language = 'json', ...restProps } = props;
  const realOptions = { ...MonacoDefaultOptions, ...options };
  const { setting } = useContext(SaDevContext);
  const editorRef = useRef(null);
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  return (
    <Suspense fallback={<LoadingFullHeight />}>
      <Card
        title={`${language}编辑器`}
        size="small"
        styles={{ body: { paddingLeft: 0, paddingRight: 0 } }}
        extra={
          <Typography.Text
            copyable={{
              text: () => {
                return editorRef?.current?.getValue();
              },
            }}
          />
        }
      >
        <Editor
          options={realOptions}
          height={height}
          theme={setting?.navTheme != 'light' ? 'vs-dark' : 'vs'}
          //theme="vs-dark"
          language={language}
          style={{ boder: 'none' }}
          className="monaco-editor-container"
          onMount={handleEditorDidMount}
          {...restProps}
        />
      </Card>
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
