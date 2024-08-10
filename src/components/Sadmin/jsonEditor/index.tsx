import VanillaJSONEditor from "./VanillaJSONEditor";
import { useContext, useEffect,useState } from 'react';
import 'vanilla-jsoneditor/themes/jse-theme-dark.css';
import { theme } from "antd";
import { SaDevContext } from "../dev";

const JsonEditor = (props) => {
  const { value = {}, onChange, options = {}, height = 400 } = props;
  const {setting} = useContext(SaDevContext);
  const { useToken } = theme;
  const { token } = useToken();
  const [content, setContent] = useState({
    json: value,
    text: undefined
  });


  const onChangeR = (e)=>{
    setContent(e);
    const inputValue = e.text?JSON.parse(e.text):'';
    onChange?.(inputValue);
    //console.log('inputValue',inputValue);
  }

  return <div className={`'my-editor' ${setting?.navTheme != 'light'?'jse-theme-dark':''}`} style={{'--jse-theme-color':token.colorPrimary}}>
  <VanillaJSONEditor
    content={content}
    onChange={onChangeR}
  />
</div>;
};

export default JsonEditor;
