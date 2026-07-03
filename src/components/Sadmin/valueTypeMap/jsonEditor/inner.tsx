import { Editor, loader } from '@monaco-editor/react';
import { useIntl } from '@umijs/max';
import { Card, Typography } from 'antd';
import * as monaco from 'monaco-editor';
import { useContext, useEffect, useRef, useState } from 'react';
import { isObj } from '../../checkers';
import { SaDevContext } from '../../dev';
import { t } from '../../helpers';

loader.config({ monaco });

const MonacoDefaultOptions = {
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
  const { options, height = 400, language = 'json', ...restProps } = props;
  const realOptions = { ...MonacoDefaultOptions, ...options };
  const { setting } = useContext(SaDevContext);
  const editorRef = useRef(null);
  const handleEditorDidMount = (editor, _monaco) => {
    editorRef.current = editor;
  };
  const intl = useIntl();

  return (
    <Card
      title={`${language}${t('editor', intl)}`}
      size="small"
      styles={{ body: { paddingLeft: 0, paddingRight: 0 } }}
      extra={
        <Typography.Text
          copyable={{
            text: () => editorRef?.current?.getValue(),
          }}
        />
      }
    >
      <Editor
        options={realOptions}
        height={height}
        theme={setting?.navTheme !== 'light' ? 'vs-dark' : 'vs'}
        language={language}
        style={{ boder: 'none' }}
        className="monaco-editor-container"
        onMount={handleEditorDidMount}
        {...restProps}
      />
    </Card>
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
      setContent(JSON.stringify(value, null, 2));
    }
  }, [value]);

  const onChangeR = (e) => {
    setContent(e);
    try {
      const inputValue = e ? JSON.parse(e) : '';
      onChange?.(inputValue);
    } catch (_e) {}
  };

  return <MonacoEditor options={options} height={height} value={content} onChange={onChangeR} />;
};

export default JsonEditor;
