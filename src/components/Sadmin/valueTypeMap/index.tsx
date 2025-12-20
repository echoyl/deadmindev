import Loading from '@/components/Loading';
import { Alert } from 'antd';
import { lazy, Suspense } from 'react';
import ConfirmForm from '../action/confirmForm';
import { tplComplie } from '../helpers';
import { MonacoEditor } from './jsonEditor';

const AliyunVideo = lazy(() => import('@/components/Sadmin/uploader/video'));
const Uploader = lazy(() => import('@/components/Sadmin/uploader'));
const TableFromBread = lazy(() => import('@/components/Sadmin/tableFromBread'));
//const ConfirmForm = lazy(() => import('@/components/Sadmin/action/confirmForm'));
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
        type="modal"
      />
    </Suspense>
  );
};

export const ConfirmFormRender = (props) => {
  let show = true;
  if (props.if) {
    show = tplComplie(props.if, props);
  }
  return show ? <ConfirmForm dataId={props.record?.id} {...props} /> : null;
};

export const MDEditorRender = (_, props) => {
  const { fieldProps } = props;
  const { options } = fieldProps;
  return <MonacoEditor {...fieldProps} language="markdown" options={options} />;
};

export const AlertRender = (_, props) => {
  return <Alert title={_} type="info" showIcon {...props.fieldProps} />;
};
