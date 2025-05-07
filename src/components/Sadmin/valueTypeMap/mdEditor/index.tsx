import request from '@/components/Sadmin/lib/request';
import UiwMDEditor from '@uiw/react-md-editor';
import type { SetStateAction } from 'react';
import { useContext, useState } from 'react';
import { message } from '../../message';
import { SaDevContext } from '../../dev';
import { isNull } from 'es-toolkit';

const insertToTextArea = (intsertString: string) => {
  const textarea = document.querySelector('textarea');
  if (!textarea) {
    return null;
  }

  let sentence = textarea.value;
  const len = sentence.length;
  const pos = textarea.selectionStart;
  const end = textarea.selectionEnd;

  const front = sentence.slice(0, pos);
  const back = sentence.slice(pos, len);

  sentence = front + intsertString + back;

  textarea.value = sentence;
  textarea.selectionEnd = end + intsertString.length;

  return sentence;
};

const fileUpload = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('toSize', '2000');
  message.loading({
    content: '上传中...',
    duration: 0,
    key: 'request_message_key',
  });
  const { code, data } = await request.post('uploader/index', {
    data: formData,
    requestType: 'form',
    //headers: { 'Content-Type': 'multipart/form-data' },
  });
  message.destroy('request_message_key');
  if (!code) {
    return data.src;
  }
  return false;
};

const onImagePasted = async (
  dataTransfer: DataTransfer,
  setMarkdown: (value: SetStateAction<string | undefined>) => void,
) => {
  const files: File[] = [];
  for (let index = 0; index < dataTransfer.items.length; index += 1) {
    const file = dataTransfer.files.item(index);

    if (file) {
      files.push(file);
    }
  }

  await Promise.all(
    files.map(async (file) => {
      const url = await fileUpload(file);
      if (!url) {
        return;
      }
      const insertedMarkdown = insertToTextArea(`![image](${url})`);
      if (!insertedMarkdown) {
        return;
      }
      setMarkdown(insertedMarkdown);
    }),
  );
};

export const MDEditorReal = (props) => {
  const { value: pvalue = '', onChange } = props;
  const [value, setValue] = useState(isNull(pvalue) ? '' : pvalue);
  const onChangeValue = (v) => {
    setValue(v);
    onChange?.(v);
  };
  const { setting } = useContext(SaDevContext);
  return (
    <UiwMDEditor
      {...props}
      overflow={false}
      value={value}
      data-color-mode={setting?.navTheme == 'light' ? 'light' : 'dark'}
      onChange={onChangeValue}
      onPaste={async (event) => {
        await onImagePasted(event.clipboardData, onChangeValue);
      }}
      onDrop={async (event) => {
        await onImagePasted(event.dataTransfer, onChangeValue);
      }}
    />
  );
};

export default MDEditorReal;
