import { LoadingOutlined } from '@ant-design/icons';
import { useModel } from '@umijs/max';
import { Button, Space, Tooltip, Typography } from 'antd';
import React from 'react';
import { isObj } from '../../checkers';
import { parseIcon, tplComplie } from '../../helpers';

export type RequestButtonProps = {
  title?: any;
  request?: Record<string, any>;
  requestUrl?: string;
  btn?: Record<string, any>;
  afterAction?: (p: any) => Promise<Record<string, any> | boolean>;
  uploadProps?: Record<string, any>;
  record?: Record<string, any>;
  fieldProps?: Record<string, any>;
  styleProps?: Record<string, any>;
  domtype?: string;
  dom?: any;
  loading?: boolean;
  initialState?: Record<string, any>;
};

export const RequestButtonRender = (props?: RequestButtonProps) => {
  const {
    btn = {},
    record,
    fieldProps = {},
    styleProps = {},
    domtype = 'button',
    loading = false,
    initialState,
  } = props || {};

  if (React.isValidElement(btn)) {
    return btn;
  }
  //return <Button>test</Button>;
  const { value = {} } = fieldProps;

  const tooltip = btn.tooltip
    ? tplComplie(btn.tooltip, { record, user: initialState?.currentUser })
    : false;

  if (btn.errorLevel) {
    delete btn.errorLevel;
  }
  const tpl = tplComplie(btn.text, { record, user: initialState?.currentUser });
  const icon = loading ? <LoadingOutlined /> : parseIcon(btn.icon);
  if (domtype == 'button') {
    //添加检测连接类型
    const btnProps: Record<string, any> = {};
    if (value?.btn?.href) {
      btnProps.href = tplComplie(value.btn.href, {
        record,
        user: initialState?.currentUser,
      });
      //console.log('value.btn.href', href, record);
    }

    const TheButton = (
      <Button {...styleProps} {...btn} {...value?.btn} {...btnProps} icon={icon}>
        {tpl}
      </Button>
    );
    //const TheButton = <div>test</div>;
    if (tooltip) {
      return <Tooltip title={tooltip}>{TheButton}</Tooltip>;
    } else {
      //console.log('React.isValidElement(TheButton)', React.isValidElement(TheButton), btn);
      //return <span onClick={() => console.log('777')}>testxx</span>;
      return TheButton;
    }
  } else {
    //文字展示
    //是否支持复制
    if (!tpl && !icon) {
      return null;
    }
    const showContent = isObj(tpl) ? JSON.stringify(tpl) : tpl;
    const textCopyable = (
      <Space>
        {icon}
        {btn.copyable ? (
          <Typography.Paragraph key="text_copyable" copyable>
            {showContent}
          </Typography.Paragraph>
        ) : (
          showContent
        )}
      </Space>
    );
    if (tooltip) {
      return <Tooltip title={tooltip}>{textCopyable}</Tooltip>;
    } else {
      //console.log('i am text ', tpl, item, record);
      return <span style={{ whiteSpace: 'pre-wrap' }}>{textCopyable}</span>;
    }
  }
};

const RequestButton = (props: RequestButtonProps) => {
  const { initialState } = useModel('@@initialState');
  return RequestButtonRender({ ...props, initialState });
};

export default RequestButton;
