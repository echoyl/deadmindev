import { messageLoadingKey, saUpload } from '@/components/Sadmin/lib/request';
import { FC, useContext, useRef, lazy, Suspense, useState, useEffect } from 'react';
import './style.less';
import { SaDevContext } from '../dev';
import LoadingFullHeight from '@/components/LoadingFullHeight';
import { message } from '@/components/Sadmin/message';
import { uid } from '../helpers';

const Editor = lazy(() =>
  import('@tinymce/tinymce-react').then((module) => ({
    default: module.Editor,
  })),
);

const TinyEditor: FC<{
  height?: number;
  width?: number;
  value?: any;
  onChange?: (value: any) => void;
  images_width100?: boolean;
}> = (props) => {
  const { height = 700, value, width, images_width100 = false } = props;
  const editorRef = useRef(null);

  const { setting } = useContext(SaDevContext);
  const [key, setKey] = useState<string>(''); //用于切换主题时重新渲染编辑器
  const [editorValue, setEditorValue] = useState<string>(value); //存储编辑器内容
  const [editorinitValue, setEditorinitValue] = useState<string>(value); //切换主题时重新初始化编辑器内容

  useEffect(() => {
    setKey(uid());
    setEditorinitValue(editorValue);
  }, [setting?.navTheme]);

  return (
    <Suspense fallback={<LoadingFullHeight />}>
      <Editor
        licenseKey="gpl"
        key={key}
        tinymceScriptSrc={setting?.adminSetting?.baseurl + 'tinymce/tinymce.min.js'}
        onInit={(evt, editor) => (editorRef.current = editor)}
        value={value}
        initialValue={editorinitValue}
        onEditorChange={(content) => {
          //console.log(content);
          setEditorValue(content);
          props.onChange?.(content);
          return;
        }}
        init={{
          min_height: height,
          width: width ? width : '100%',
          menubar: false,
          language: 'zh_CN',
          placeholder: '请输入',
          //skin: 'snow',
          skin: setting?.navTheme == 'light' ? 'oxide' : 'oxide-dark',
          content_css: setting?.navTheme == 'light' ? 'default' : 'dark',
          relative_urls: false,
          remove_script_host: false,
          convert_urls: false,
          font_family_formats:
            '微软雅黑=Microsoft YaHei,Helvetica Neue,PingFang SC,sans-serif;苹果苹方=PingFang SC,Microsoft YaHei,sans-serif;宋体=simsun,serif;仿宋体=FangSong,serif;黑体=SimHei,sans-serif;Arial=arial,helvetica,sans-serif;Arial Black=arial black,avant garde;Book Antiqua=book antiqua,palatino;',
          font_size_formats: '12px 14px 16px 18px 24px 36px 48px 56px 72px',
          plugins: [
            'advlist',
            'autolink',
            'lists',
            'link',
            'image',
            'charmap',
            'preview',
            'anchor',
            'searchreplace',
            'visualblocks',
            'code',
            'fullscreen',
            'insertdatetime',
            'media',
            'table',
            'code',
            'help',
            'wordcount',
            'indent2em',
            'axupimgs',
          ],
          toolbar:
            'undo redo blocks fontfamily fontsize lineheight ' +
            'bold italic underline strikethrough forecolor backcolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent indent2em | ' +
            'removeformat | axupimgs link media table | code',
          toolbar_mode: 'wrap',
          content_style: 'body { font-family:Microsoft YaHei,Arial,sans-serif; font-size:14px }',
          images_width100,
          images_upload_handler: (blobInfo, progress) =>
            new Promise((resolve, reject) => {
              //console.log(blobInfo.blob());
              progress(50);
              const fd = new FormData();
              let ti;
              const f1 = (pr: number) => {
                progress(pr);
                if (pr < 90) {
                  pr += Math.ceil(Math.random() * 10) + 1;
                  ti = setTimeout(
                    () => {
                      f1(pr);
                    },
                    (Math.ceil(Math.random() * 10) + 1) * 10,
                  );
                }
              };
              fd.append('file', blobInfo.blob(), blobInfo.filename());
              fd.append('toSize', 1200);
              f1(1);
              saUpload(fd)
                .then(function (ret) {
                  clearTimeout(ti);
                  if (ret.code) {
                    reject({ message: ret.msg, remove: true });
                  } else {
                    progress(100);
                    //progress(ret.data.src);
                    resolve(ret.data.src);
                  }
                })
                .catch(function (error) {
                  reject({ message: error.message, remove: true });
                });
            }),
          file_picker_callback: (callback, value, meta) => {
            //文件分类
            var filetype =
              '.pdf, .txt, .zip, .rar, .7z, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .mp3, .mp4,.mov';
            //模拟出一个input用于添加本地文件
            var input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.setAttribute('accept', filetype);
            input.click();
            input.onchange = function () {
              const fd = new FormData();
              var file = this.files[0];

              fd.append('file', file, file.name);
              fd.append('isFile', '1');
              //增加上传的loading
              message?.loading({ content: '上传中...', duration: 0, key: messageLoadingKey });
              saUpload(fd).then(function (ret) {
                if (ret.code) {
                  //上传失败
                  message?.destroy(messageLoadingKey);
                  return;
                } else {
                  callback(ret.data.src, { title: file.name, text: file.name });
                }
              });
            };
          },
        }}
      />
    </Suspense>
  );
};
export default TinyEditor;
