import { useContext, useState, lazy, Suspense, useEffect, useRef } from 'react';
import LoadingFullHeight from '@/components/LoadingFullHeight';
import { SaDevContext } from '../../dev';
import { isObj } from '../../checkers';

const Editor = lazy(() => import('@monaco-editor/react'));

const JsonEditor = (props) => {
  const { value = '', onChange, height = 400, readOnly } = props;
  const { setting } = useContext(SaDevContext);
  const options = {
    selectOnLineNumbers: false,
    automaticLayout: true,
    minimap: {
      enabled: false,
    },
    readOnly,
    autoIndent: true,
  };

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

  return (
    <Suspense fallback={<LoadingFullHeight />}>
      <Editor
        options={options}
        height={height}
        theme={setting?.navTheme != 'light' ? 'vs-dark' : 'vs'}
        //theme="vs-dark"
        language="json"
        value={content}
        onChange={onChangeR}
      />
    </Suspense>
  );
};

export default JsonEditor;
