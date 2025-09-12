import { TranslationOutlined } from '@ant-design/icons';
import ConfirmForm from '../../action/confirmForm';
import { saFormTabColumnsType } from '../../helpers';
import { useContext, useEffect, useState } from 'react';
import { SaDevContext } from '..';
import { SaContext } from '../../posts/table';
import { Tooltip } from 'antd';
import { isArr } from '../../checkers';

const TranslationModal = (props: {
  column?: Record<string, any>;
  values?: Record<string, any>;
  onChange?: (values: any) => void;
}) => {
  const { column = { dataIndex: 'title', title: '标题' }, values, onChange } = props;

  const { setting } = useContext(SaDevContext);

  const { formRef } = useContext(SaContext);

  //console.log('formRef', formRef, formRef?.current?.getFieldsValue());

  const tabs: saFormTabColumnsType = setting?.adminSetting?.locales.map((lo) => {
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
  });

  const [value, setValue] = useState(values);

  useEffect(() => {
    if (formRef?.current && !values) {
      setValue(formRef?.current?.getFieldsValue());
    }
  }, []);

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
      onChange={(values) => {
        setValue(values);
        if (onChange) {
          onChange(values);
        } else {
          formRef?.current?.setFieldsValue(values);
        }

        //console.log(values, formRef?.current?.getFieldsValue());
      }}
    />
  );
};

export default TranslationModal;
