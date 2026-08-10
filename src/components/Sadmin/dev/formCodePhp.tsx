import { CodeOutlined, ReloadOutlined } from '@ant-design/icons';
import { ProField } from '@ant-design/pro-components';
import { Button, Card, Space, Typography } from 'antd';
import { useContext, useState } from 'react';
import { SaPageContext } from '../404';
import ButtonModal from '../action/buttonModal';
import request from '../lib/request';

const FormCodePhp = (props: Record<string, any>) => {
  const { trigger } = props;
  const { pageMenu = { id: 0, model_id: 0 } } = useContext(SaPageContext);
  const [text, setText] = useState();
  const load = () => {
    request
      .get('dev/model/getFormCodeByColumns', { params: { id: pageMenu?.model_id } })
      .then((res) => {
        const { data, code, msg } = res;
        if (!code) {
          setText(data.code);
        } else {
          setText(msg);
        }
      });
    return;
  };
  return (
    <ButtonModal
      trigger={trigger ? trigger : <Button icon={<CodeOutlined />} />}
      minHeight={650}
      title="通过模型字段快速格式化php代码"
      afterOpenChange={(open) => {
        if (open && !text) {
          load();
        }
      }}
    >
      <Card
        title={
          <Space>
            <Button>
              <Typography.Text copyable={{ text }} />
            </Button>
            <Button onClick={load} color="primary" icon={<ReloadOutlined />} />
          </Space>
        }
      >
        <ProField
          text={text}
          valueType="code"
          mode="read"
          fieldProps={{ style: { width: '100%' } }}
        />
      </Card>
    </ButtonModal>
  );
};

export default FormCodePhp;
