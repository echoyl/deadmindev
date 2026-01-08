import { dataRequestManager } from '@/components/Sadmin/lib/request';
import { ProFormCascader } from '@ant-design/pro-components';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import cache from './helper/cache';

export async function getPca(level: number, topCode: string = '') {
  const key = ['pca_', level, topCode].join('');
  let _data = await cache.get(key);
  if (!_data) {
    const { data } = await dataRequestManager.getData(
      'helper/pca',
      { params: { level: level, topCode } },
      key,
    );
    cache.set(key, data);
    _data = data;
  }
  return _data;
}

export const getPcaValue = async (
  label: string[],
  level: number,
  fromTo = ['label', 'value'],
  topCode: string,
): Promise<any[]> => {
  let data = await getPca(level, topCode);

  const value: any[] = [];
  label.forEach((v) => {
    for (const i in data) {
      const dv = data[i];
      if (dv[fromTo[0]] == v) {
        value.push(dv[fromTo[1]]);
        data = dv.children;
        break;
      }
    }
  });

  return value;
};
export const PcaRender: FC = (props: { text?: any; level?: number; topcode?: string }) => {
  const { text = [], level = 3, topcode = '' } = props;

  const [textValue, setText] = useState<any[]>([]);

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

const SaPca: FC = (props: Record<string, any>) => {
  const { level = 3, topcode } = props || {};
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
