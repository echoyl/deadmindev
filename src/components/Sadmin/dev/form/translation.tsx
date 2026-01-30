import { TranslationOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { useContext, useEffect, useState } from 'react';
import { SaDevContext } from '..';
import ConfirmForm from '../../action/confirmForm';
import { isArr } from '../../checkers';
import type { saFormTabColumnsType } from '../../helpers';
import { SaContext } from '../../posts/table';

const TranslationModal = (props: {
  column?: Record<string, any>;
  values?: Record<string, any>;
  onChange?: (values: any) => void;
}) => {
  const { column = { dataIndex: 'title', title: '标题' }, values, onChange } = props;

  const { setting } = useContext(SaDevContext);

  const { formRef } = useContext(SaContext);

  //console.log('formRef', formRef, formRef?.current?.getFieldsValue());
  const tabs: saFormTabColumnsType = setting?.adminSetting?.locales.map(
    (lo: Record<string, any>) => {
      let index: string | string[] = '';
      if (isArr(column?.dataIndex)) {
        //获取最后一个元素后 解构剩余元素，最后一个元素和语言包名josn _
        const or = [...column?.dataIndex];
        index = or.pop();

        index = [...or, [index, lo.name].join('_')];
        //console.log('index', index, or);
      } else {
        index = [column?.dataIndex, lo.name].join('_');
      }
      return {
        title: lo.title,
        formColumns: [
          {
            dataIndex: index,
            title: column?.title,
            valueType: column?.valueType,
          },
        ],
      };
    },
  );

  const [value, setValue] = useState(values);

  useEffect(() => {
    if (formRef?.current && !values) {
      setValue(formRef?.current?.getFieldsValue());
    }
  }, []);

  useEffect(() => {
    if (values) {
      setValue(values);
    }
  }, [values]);

  return (
    <ConfirmForm
      tabs={tabs}
      trigger={
        <Tooltip title="多语言">
          <TranslationOutlined />
        </Tooltip>
      }
      saFormProps={{ devEnable: false }}
      value={value}
      onChange={(v) => {
        setValue(v);
        if (onChange) {
          onChange(v);
        } else {
          formRef?.current?.setFieldsValue(v);
        }

        //console.log(values, formRef?.current?.getFieldsValue());
      }}
    />
  );
};

export default TranslationModal;
