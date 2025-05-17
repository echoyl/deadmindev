import { useContext, useState, lazy, Suspense, useEffect } from 'react';
import 'vanilla-jsoneditor/themes/jse-theme-dark.css';
import { theme } from 'antd';
import { SaDevContext } from '../dev';
import LoadingFullHeight from '@/components/LoadingFullHeight';

const VanillaJSONEditor = lazy(() => import('./VanillaJSONEditor'));

const JsonEditor = (props) => {
  const { value = {}, onChange, options = {}, height = 400, readOnly } = props;
  const { setting } = useContext(SaDevContext);
  const { useToken } = theme;
  const { token } = useToken();
  const [content, setContent] = useState({
    json: value,
    text: undefined,
  });
  useEffect(() => {
    if (readOnly) {
      //当只读模式下根据外面的值来更新数据
      setContent({
        json: value,
        text: undefined,
      });
    }
  }, [value]);
  const onChangeR = (e) => {
    setContent(e);
    try {
      const inputValue = e.text ? JSON.parse(e.text) : '';
      onChange?.(inputValue);
    } catch (e) {
      //console.log(e);
    }

    //console.log('inputValue',inputValue);
  };

  return (
    <div
      className={`'my-editor' ${setting?.navTheme != 'light' ? 'jse-theme-dark' : ''}`}
      style={{ '--jse-theme-color': token.colorPrimary }}
    >
      <Suspense fallback={<LoadingFullHeight />}>
        <VanillaJSONEditor
          content={content}
          onChange={onChangeR}
          height={height}
          readOnly={readOnly}
        />
      </Suspense>
    </div>
  );
};

export default JsonEditor;
