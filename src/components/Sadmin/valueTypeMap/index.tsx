import Loading from '@/components/Loading';
import type { ProFieldFCRenderProps, ProRenderFieldPropsType } from '@ant-design/pro-components';
import { ProFormCascader } from '@ant-design/pro-components';
import { Alert } from 'antd';
import { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { ConfirmRender } from '../action/confirm';
import ConfirmForm from '../action/confirmForm';
import CustomerColumnRender from '../action/customerColumn';
import ModalJson from '../action/modalJson';
import { getJson, isObj } from '../checkers';
import DebounceSelect from '../DebounceSelect';
import { FormCalendarRender } from '../formCalendar';
import { tplComplie } from '../helpers';
import JsonForm from '../jsonForm';
import { MapShowRender, MapinputRender } from '../map';
import { ModalSelectRender } from '../modalSelect';
import SaOptions, { SaEditorTable } from '../options';
import { getPca, PcaRender } from '../pca';
import PermGroup from '../perm/group';
import { SaTransferRender } from '../transfer';
import TinyEditor from '../tinyEditor';
import { wxMenuRender } from '../wxMenu';
import SaAutoCompleteMap from './autoComplete';
import { ColorPickerMap, ColorPickerRenderMap } from './colorPicker';
import { DropdownActionMap } from './dropdownAction';
import { Guiges } from './guigePanel';
import IconSelect, { IconSelectRender } from './iconSelect';
import JsonEditor, { MonacoEditor } from './jsonEditor';
import SaSliderMap from './saSlider';
import SearchSelect from './search/select';
import { RadioSegmentedMap } from './radioSegmented';

const AliyunVideo = lazy(() => import('@/components/Sadmin/uploader/video'));
const Uploader = lazy(() => import('@/components/Sadmin/uploader'));
const TableFromBread = lazy(() => import('@/components/Sadmin/tableFromBread'));
const Markdown = lazy(() => import('@/components/Sadmin/valueTypeMap/markdown'));
//const ConfirmForm = lazy(() => import('@/components/Sadmin/action/confirmForm'));
const AliyunVideoRender = (props: Record<string, any>) => {
  return (
    <Suspense fallback={<Loading />}>
      <AliyunVideo {...props} />
    </Suspense>
  );
};

const UploaderRender = (props: Record<string, any>) => {
  return (
    <Suspense>
      <Uploader {...props} />
    </Suspense>
  );
};

const tableFromBreadRender = (_: any, props: ProFieldFCRenderProps) => {
  //console.log('saFormTable here', props);
  const { fieldProps } = props;
  const { type = 'modal', props: innerProps = {} } = fieldProps || {};
  return (
    <Suspense>
      <TableFromBread
        type={type}
        alwaysenable={fieldProps.alwaysenable}
        fieldProps={{ ...fieldProps, props: { ...innerProps, tableProps: { search: false } } }}
        readonly={fieldProps.readonly}
        scrollHeight={fieldProps.scrollHeight}
      />
    </Suspense>
  );
};

const ConfirmFormRender = (props: Record<string, any>) => {
  let show = true;
  if (props.if) {
    show = tplComplie(props.if, props);
  }
  return show ? <ConfirmForm dataId={props.record?.id} {...props} /> : null;
};

const MDEditorRender = (_: any, props: ProFieldFCRenderProps) => {
  const { fieldProps } = props;
  const { options } = fieldProps;
  return <MonacoEditor {...fieldProps} language="markdown" options={options} />;
};

const AlertRender = (_: any, props: ProFieldFCRenderProps) => {
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

export default {
  uploader: {
    render: (image, props) => {
      image = getJson(image, image);
      return <UploaderRender {...props.fieldProps} value={image} buttonType="table" readonly />;
    },
    formItemRender: (text, props) => {
      return <UploaderRender {...props.fieldProps} />;
    },
  },
  aliyunVideo: {
    render: (image) => {
      return <>-</>; //列表默认不显示
    },
    formItemRender: (text, props) => {
      return <AliyunVideoRender {...props.fieldProps} />;
    },
  },
  saFormTable: {
    render: (text) => {
      console.log('read only');
      return text;
    },
    formItemRender: tableFromBreadRender,
  },
  wxMenu: {
    render: wxMenuRender,
    formItemRender: wxMenuRender,
  },
  tinyEditor: {
    render: (text) => text,
    formItemRender: (text, props) => {
      return <TinyEditor {...props.fieldProps} />;
    },
  },
  guigePanel: {
    render: (text, props) => <Guiges {...props.fieldProps} />,
    formItemRender: (text, props) => {
      return <Guiges {...props.fieldProps} />;
    },
  },
  saEditorTable: {
    render: (text) => text,
    formItemRender: (text, props) => {
      return <SaEditorTable {...props.fieldProps} />;
    },
  },
  jsonEditor: {
    render: (text, props) => {
      return <JsonEditor {...props.fieldProps} value={text} readOnly={true} />;
    },
    formItemRender: (text, props) => {
      return <JsonEditor {...props.fieldProps} />;
    },
  },
  tmapInput: MapinputRender,
  tmapShow: MapShowRender,
  bmapInput: MapinputRender,
  bmapShow: MapShowRender,
  mapInput: MapinputRender,
  mapShow: MapShowRender,
  pca: {
    render: (text, props) => {
      const { fieldProps } = props;
      return <PcaRender text={text} level={fieldProps.level} topcode={fieldProps.topCode} />;
    },
    formItemRender: (text, props) => {
      const level = props.fieldProps.level ? props.fieldProps.level : 3;
      const topCode = props.fieldProps.topCode ? props.fieldProps.topCode : '';
      delete props.fieldProps.topCode;

      if (props.fieldProps.value) {
        props.fieldProps.value = getJson(props.fieldProps.value, []);
        if (Array.isArray(props.fieldProps.value)) {
          if (props.fieldProps.multiple) {
            props.fieldProps.value = props.fieldProps.value.map((sv) => {
              return sv.map((v) => parseInt(v));
            });
          } else {
            props.fieldProps.value = props.fieldProps.value.map((v) => parseInt(v));
          }
        }
      }
      return (
        <ProFormCascader
          noStyle
          {...props.fieldProps}
          fieldProps={{ ...props.fieldProps }}
          request={async () => {
            const data = await getPca(level, topCode);
            return data;
          }}
        />
      );
    },
  },
  permGroup: {
    formItemRender: (text, props) => {
      return <PermGroup {...props.fieldProps} />;
    },
    render: (text) => text,
  },
  debounceSelect: {
    formItemRender: (text, props) => {
      return <DebounceSelect {...props.fieldProps} />;
    },
    render: (text) => {
      return <span>{text?.label ? text?.label : text?.value}</span>;
    },
  },
  searchSelect: {
    formItemRender: (text, props) => {
      return <SearchSelect {...props.fieldProps} />;
    },
    render: (text, props) => {
      return <SearchSelect {...props.fieldProps} value={text} readonly={true} />;
    },
  },
  jsonForm: {
    formItemRender: (text, props) => {
      return <JsonForm {...props.fieldProps} />;
    },
    render: (text, props) => {
      return <JsonForm {...props.fieldProps} />;
    },
  },
  link: {
    render: (link, props) => {
      if (isObj(link)) {
        return <Link to={link.href}>{link.title}</Link>;
      } else {
        const { fieldProps, record } = props;
        const { path, foreign_key, local_key } = fieldProps;
        if (path) {
          return (
            <Link to={path + '?' + foreign_key + '=' + (local_key ? record[local_key] : link)}>
              {link}
            </Link>
          );
        } else {
          return link;
        }
      }
    },
  },
  expre: {
    render: (_, props) => {
      if (!props.record) {
        props.record = _;
      }
      return tplComplie(props.fieldProps.exp, props);
    },
  },
  saFormList: {
    formItemRender: (text, props) => {
      const { fieldProps } = props;
      const name = fieldProps.dataindex ? fieldProps.dataindex : fieldProps.id;
      return (
        <SaOptions
          name={name}
          columns={props.columns}
          {...fieldProps}
        />
      );
    },
    render: (text) => text,
  },
  confirm: {
    render: ConfirmRender,
  },
  confirmForm: {
    render: (_, props) => {
      return <ConfirmFormRender record={props.record} {...props.fieldProps} />;
    },
    formItemRender: (_, props) => {
      return <ConfirmFormRender {...props.fieldProps} />;
    },
  },
  modalJson: {
    formItemRender: (text, props) => {
      return <ModalJson {...props.fieldProps} />;
    },
    render: (text) => text,
  },
  modalSelect: {
    render: ModalSelectRender,
    formItemRender: ModalSelectRender,
  },
  customerColumn: {
    render: (text, props) => {
      const { fieldProps } = props;
      return (
        <CustomerColumnRender
          {...fieldProps}
          type={props.record ? 'table' : 'form'}
          record={props.record ? props.record : {}}
          text={text}
        />
      );
    },
    formItemRender: (text, props) => {
      const { fieldProps } = props;
      return <CustomerColumnRender {...fieldProps} type="form" record={{}} text={text} />;
    },
  },
  formCalendar: {
    formItemRender: FormCalendarRender,
    render: FormCalendarRender,
  },
  saTransfer: {
    render: SaTransferRender,
    formItemRender: SaTransferRender,
  },
  html: {
    render: (text) => {
      return <div dangerouslySetInnerHTML={{ __html: text }}></div>;
    },
    formItemRender: (text) => {
      return <div dangerouslySetInnerHTML={{ __html: text }}></div>;
    },
  },
  colorPicker: {
    render: ColorPickerRenderMap,
    formItemRender: ColorPickerMap,
  },
  mdEditor: {
    render: (_) => {
      return _;
    },
    formItemRender: MDEditorRender,
  },
  iconSelect: {
    render: IconSelectRender,
    formItemRender: IconSelect,
  },
  saAutoComplete: {
    render: (_) => {
      return _;
    },
    formItemRender: SaAutoCompleteMap,
  },
  dropdownAction: {
    render: DropdownActionMap,
    formItemRender: DropdownActionMap,
  },
  saSlider: {
    render: SaSliderMap,
    formItemRender: SaSliderMap,
  },
  radioSegmented: {
    render: RadioSegmentedMap,
    formItemRender: RadioSegmentedMap,
  },
  alert: {
    render: AlertRender,
    formItemRender: AlertRender,
  },
} as Record<string, ProRenderFieldPropsType>;
