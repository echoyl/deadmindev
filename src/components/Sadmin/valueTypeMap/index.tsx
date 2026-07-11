import Loading from '@/components/Loading';
import type { ProFieldFCRenderProps } from '@ant-design/pro-components';
import { Alert } from 'antd';
import { lazy, Suspense } from 'react';
import ConfirmForm from '../action/confirmForm';
import { tplComplie } from '../helpers';
import { MonacoEditor } from './jsonEditor';

const AliyunVideo = lazy(() => import('@/components/Sadmin/uploader/video'));
const Uploader = lazy(() => import('@/components/Sadmin/uploader'));
const TableFromBread = lazy(() => import('@/components/Sadmin/tableFromBread'));
const Markdown = lazy(() => import('@/components/Sadmin/valueTypeMap/markdown'));
//const ConfirmForm = lazy(() => import('@/components/Sadmin/action/confirmForm'));
export const AliyunVideoRender = (props: Record<string, any>) => {
  return (
    <Suspense fallback={<Loading />}>
      <AliyunVideo {...props} />
    </Suspense>
  );
};

export const UploaderRender = (props: Record<string, any>) => {
  return (
    <Suspense>
      <Uploader {...props} />
    </Suspense>
  );
};

export const tableFromBreadRender = (_: any, props: ProFieldFCRenderProps) => {
  //console.log('saFormTable here', props);
  const { fieldProps } = props;

  return (
    <Suspense>
      <TableFromBread
        alwaysenable={fieldProps.alwaysenable}
        fieldProps={{ ...fieldProps, props: { tableProps: { search: false } } }}
        readonly={fieldProps.readonly}
        type="modal"
        scrollHeight={fieldProps.scrollHeight}
      />
    </Suspense>
  );
};

export const ConfirmFormRender = (props: Record<string, any>) => {
  let show = true;
  if (props.if) {
    show = tplComplie(props.if, props);
  }
  return show ? <ConfirmForm dataId={props.record?.id} {...props} /> : null;
};

export const MDEditorRender = (_: any, props: ProFieldFCRenderProps) => {
  const { fieldProps } = props;
  const { options } = fieldProps;
  return <MonacoEditor {...fieldProps} language="markdown" options={options} />;
};

export const AlertRender = (_: any, props: ProFieldFCRenderProps) => {
  const { message = '', title = '', ...restProps } = props.fieldProps;
  return <Alert type="info" showIcon title={title ? title : message || _} {...restProps} />;
};

export const MarkdownRender = (props: Record<string, any>) => {
  const { children, ...rest } = props;
  return (
    <Suspense>
      <Markdown {...rest}>{children}</Markdown>
    </Suspense>
  );
};
