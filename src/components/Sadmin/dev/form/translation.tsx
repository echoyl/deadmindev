import { TranslationOutlined } from '@ant-design/icons';
import ConfirmForm from '../../action/confirmForm';
import { saFormTabColumnsType } from '../../helpers';
import { useContext, useEffect, useState } from 'react';
import { SaDevContext } from '..';
import { SaContext } from '../../posts/table';
import { Tooltip } from 'antd';

const TranslationModal = (props) => {
  const { column = { dataIndex: 'title', title: '标题' } } = props;

  const { setting } = useContext(SaDevContext);

  const { formRef } = useContext(SaContext);

  //console.log('formRef', formRef, formRef?.current?.getFieldsValue());

  const tabs: saFormTabColumnsType = setting?.adminSetting?.locales.map((lo) => {
    return {
      title: lo.title,
      formColumns: [
        {
          dataIndex: [column?.dataIndex, lo.name].join('_'),
          title: column?.title,
          valueType: column?.valueType,
        },
      ],
    };
  });

  const [value, setValue] = useState();

  useEffect(() => {
    setValue(formRef?.current?.getFieldsValue());
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
        formRef?.current?.setFieldsValue(values);
        //console.log(values, formRef?.current?.getFieldsValue());
      }}
    />
  );
};

export default TranslationModal;
