import { lazy, Suspense } from 'react';
import { tplComplie } from '../helpers';
import Loading from '@/components/Loading';
import { MonacoEditor } from './jsonEditor';

const AliyunVideo = lazy(() => import('@/components/Sadmin/uploader/video'));
const Uploader = lazy(() => import('@/components/Sadmin/uploader'));
const TableFromBread = lazy(() => import('@/components/Sadmin/tableFromBread'));
const ConfirmForm = lazy(() => import('@/components/Sadmin/action/confirmForm'));
export const AliyunVideoRender = (props) => {
  return (
    <Suspense fallback={<Loading />}>
      <AliyunVideo {...props} />
    </Suspense>
  );
};

export const UploaderRender = (props) => {
  return (
    <Suspense>
      <Uploader {...props} />
    </Suspense>
  );
};

export const tableFromBreadRender = (text, props) => {
  //console.log('saFormTable here', props);
  const { fieldProps } = props;

  return (
    <Suspense>
      <TableFromBread
        alwaysenable={fieldProps.alwaysenable}
        fieldProps={{ ...fieldProps, props: { tableProps: { search: false } } }}
        readonly={fieldProps.readonly}
      />
    </Suspense>
  );
};

export const ConfirmFormRender = (props) => {
  let show = true;
  if (props.if) {
    show = tplComplie(props.if, props);
  }
  return (
    <Suspense fallback={<Loading />}>
      {show ? <ConfirmForm dataId={props.record?.id} {...props} /> : null}
    </Suspense>
  );
};

export const MDEditorRender = (_, props) => {
  const { fieldProps } = props;
  const { options } = fieldProps;
  return <MonacoEditor {...fieldProps} language="markdown" options={options} />;
};
