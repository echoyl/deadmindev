import { PageLoading } from '@ant-design/pro-components';
import { lazy, Suspense } from 'react';
import { tplComplie } from '../helpers';

const AliyunVideo = lazy(() => import('@/components/Sadmin/uploader/video'));
const Uploader = lazy(() => import('@/components/Sadmin/uploader'));
const TableFromBread = lazy(() => import('@/components/Sadmin/tableFromBread'));
const ConfirmForm = lazy(() => import('@/components/Sadmin/action/confirmForm'));
const MDEditorReal = lazy(() => import('@/components/Sadmin/valueTypeMap/mdEditor'));
export const AliyunVideoRender = (props) => {
  return (
    <Suspense fallback={<PageLoading />}>
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
    <Suspense fallback={<PageLoading />}>
      {show ? <ConfirmForm dataId={props.record?.id} {...props} /> : null}
    </Suspense>
  );
};

export const MDEditorRender = (_, props) => {
  const { fieldProps } = props;
  return (
    <Suspense fallback={<PageLoading />}>
      <MDEditorReal {...fieldProps} style={{ margin: '0 1px' }} />
    </Suspense>
  );
};
