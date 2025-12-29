import { SettingOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { createContext, FC, useContext, useEffect, useState } from 'react';
import ConfirmForm from '../action/confirmForm';
import { getJson } from '../checkers';
import request from '../lib/request';
import { SaContext } from '../posts/table';

export const DevJsonContext = createContext<{
  json?: any;
  setJson?: (json: any) => void;
}>({});

const getValue = (uid, pageMenu) => {
  //无uid表示插入列
  if (!uid) {
    return {};
  }
  const pconfig = getJson(pageMenu?.schema?.form_config, []);

  let value = {};
  //console.log('config', config);
  pconfig?.tabs?.map((tab) => {
    if (tab.uid == uid) {
      //tab支持编辑修改其属性
      value = tab;
    } else {
      tab.config?.map((group) => {
        if (group.uid == uid) {
          value = group;
        } else {
          group.columns?.map((column) => {
            if (column.uid == uid) {
              value = column;
            }
          });
        }
      });
    }
  });
  return value;
};

const JsonForm: FC<{
  height?: number;
  value?: { config: any[]; value: any };
  onChange?: (value: any) => void;
  config?: Record<string, any>;
  uid?: string; //组件唯一标识
}> = (props) => {
  const { value, config, uid, onChange } = props;
  //console.log('json form init props', props);
  const trigger = <Button icon={<SettingOutlined />}>详情</Button>;
  const { tableDesigner: { pageMenu, reflush, editUrl = '' } = {} } = useContext(SaContext);
  const [cvalue, setCvalue] = useState<Record<string, any>>({});
  useEffect(() => {
    const nvalue = getValue(uid, pageMenu);
    setCvalue(nvalue);
  }, [pageMenu]);
  return (
    <DevJsonContext.Provider
      value={{
        json: { config },
        setJson: (json) => {
          //修改当前组件的配置
          request
            .post(editUrl, {
              data: {
                base: {
                  id: pageMenu?.id,
                  uid,
                  ...cvalue,
                  props: { ...cvalue?.props, fieldProps: { config: json } },
                },
              },
            })
            .then(({ data, code }) => {
              if (!code) {
                reflush?.(data);
              }
            });
        },
      }}
    >
      <ConfirmForm
        trigger={trigger}
        msg="配置页面"
        tabs={config?.desc?.tabs}
        value={value}
        afterActionType="close"
        onChange={onChange}
        showType="drawer"
      />
    </DevJsonContext.Provider>
  );
};

export default JsonForm;
