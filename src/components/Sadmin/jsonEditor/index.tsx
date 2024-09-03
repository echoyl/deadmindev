import { useContext, useState, lazy, Suspense } from 'react';
import 'vanilla-jsoneditor/themes/jse-theme-dark.css';
import { theme } from 'antd';
import { SaDevContext } from '../dev';
import { PageLoading } from '@ant-design/pro-components';

const VanillaJSONEditor = lazy(() => import('./VanillaJSONEditor'));

const JsonEditor = (props) => {
  const { value = {}, onChange, options = {}, height = 400 } = props;
  const { setting } = useContext(SaDevContext);
  const { useToken } = theme;
  const { token } = useToken();
  const [content, setContent] = useState({
    json: value,
    text: undefined,
  });

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
      <Suspense fallback={<PageLoading />}>
        <VanillaJSONEditor content={content} onChange={onChangeR} />
      </Suspense>
    </div>
  );
};

export default JsonEditor;
