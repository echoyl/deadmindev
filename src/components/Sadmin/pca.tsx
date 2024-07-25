import request from '@/components/Sadmin/lib/request';
import { ProFormCascader } from '@ant-design/pro-form';
import { FC, useEffect, useState } from 'react';
import cache from './helper/cache';

export async function getPca(level: number, topCode: string) {
  const key = topCode ? 'pca_' + level + topCode : 'pca_' + level;
  let _data = await cache.get(key);
  if (!_data) {
    const { data } = await request.get('helper/pca', { params: { level: level, topCode } });
    cache.set(key, data);
    _data = data;
  }
  return _data;
}

export async function getPcaValue(label, level, fromTo = ['label', 'value'], topCode: string) {
  let data = await getPca(level, topCode);

  let value = [];
  label.forEach((v, k) => {
    for (var i in data) {
      let dv = data[i];
      if (dv[fromTo[0]] == v) {
        value.push(dv[fromTo[1]]);
        data = dv.children;
        break;
      }
    }
  });

  return value;
}
export const PcaRender: FC = (props: { text?: any; level?: number; topcode?: string }) => {
  const { text = [], level = 3, topcode = '' } = props;

  const [textValue, setText] = useState([]);
  //console.log('out pca render ', text);
  useEffect(() => {
    //console.log('pca render ', text);
    if (text && text.length > 0) {
      getPcaValue(text, level, ['value', 'label'], topcode).then((v) => {
        setText(v);
      });
    }
  }, [text]);

  return <>{textValue?.join(' / ')}</>;
};

const SaPca: Fc = (props) => {
  const { level = 3, topcode } = props;
  //const topCode = '360000,360100';
  return (
    <ProFormCascader
      {...props}
      fieldProps={{ ...props.fieldProps }}
      request={async () => {
        const data = await getPca(level, topcode);
        return data;
      }}
    />
  );
  //const { editorState } = this.state
};
export default SaPca;
