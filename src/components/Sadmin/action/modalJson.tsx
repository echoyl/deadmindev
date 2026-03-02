import { ModalForm, ProFormItem, ProFormTextArea } from '@ant-design/pro-components';
import { Button } from 'antd';
import type { FC } from 'react';
import { t } from '../helpers';
import JsonEditor from '../valueTypeMap/jsonEditor';

const ModalJson: FC<{
  title?: string;
  onChange?: (value: any) => void;
  value?: any;
  type?: string;
  trigger?: React.ReactNode;
  btn?: Record<string, any>;
}> = (props) => {
  const { title = t('config'), value, type = 'json', trigger, btn } = props;

  const button = (
    <Button size="small" {...btn}>
      {btn?.title ? btn.title : title}
    </Button>
  );

  return (
    <ModalForm
      trigger={trigger ? trigger : button}
      title={t('config')}
      initialValues={{ content: value }}
      onFinish={async (values) => {
        //console.log(values);
        props.onChange?.(values.content);
        return true;
      }}
    >
      <ProFormItem name="content">
        {type == 'json' ? <JsonEditor /> : <ProFormTextArea />}
      </ProFormItem>
    </ModalForm>
  );
};

export default ModalJson;
