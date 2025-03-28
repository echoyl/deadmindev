import { CodeOutlined, ReloadOutlined, ToolOutlined } from '@ant-design/icons';
import { ProField } from '@ant-design/pro-components';
import ButtonModal from '../action/buttonModal';
import { Button, Card, Space, Typography } from 'antd';
import React, { useState } from 'react';
import request from '../lib/request';

const FormCodePhp = (props: Record<string, any>) => {
  const { pageMenu = { id: 0, model_id: 0 } } = props;
  const [text, setText] = useState();
  const load = () => {
    request
      .get('dev/model/getFormCodeByColumns', { params: { id: pageMenu.model_id } })
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
      trigger={<Button icon={<CodeOutlined />} />}
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
