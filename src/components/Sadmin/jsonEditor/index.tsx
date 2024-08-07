import VanillaJSONEditor from "./VanillaJSONEditor";
import { useEffect,useState } from 'react';
import 'vanilla-jsoneditor/themes/jse-theme-dark.css';
import { useModel } from "@umijs/max";
import { getTheme } from "../themeSwitch";
import { theme } from "antd";

const JsonEditor = (props) => {
  const { value = {}, onChange, options = {}, height = 400 } = props;
  const { initialState } = useModel('@@initialState');
  const themeStr = getTheme(initialState?.settings?.adminSetting);
  const { useToken } = theme;
  const { token } = useToken();
  const [dark,setDark] = useState('');
  const [content, setContent] = useState({
    json: value,
    text: undefined
  });

  useEffect(()=>{
    setDark(themeStr != 'light'?'jse-theme-dark':'');
  },[themeStr]);

  const onChangeR = (e)=>{
    setContent(e);
    onChange?.(e.text);
    //console.log(e);
  }

  return <div className={`'my-editor' ${dark}`} style={{'--jse-theme-color':token.colorPrimary}}>
  <VanillaJSONEditor
    content={content}
    onChange={onChangeR}
  />
</div>;
};

export default JsonEditor;
