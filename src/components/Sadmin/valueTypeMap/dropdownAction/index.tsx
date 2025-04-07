import { Badge, Dropdown, Space, Tag } from 'antd';
import React, { useContext } from 'react';
import { SaContext } from '../../posts/table';
import { SaDevContext } from '../../dev';
import { ConfirmTriggerClick } from '../../action/confirm';
import { iconToElement } from '../iconSelect';

const DropdownAction: React.FC = (props: {
  fieldNames?: string;
  modelName?: string;
  url?: string;
  value?: any;
  data?: { [key: string]: any };
  id?: number;
  callback?: (value: any) => void;
  //trigger?: (value: any) => ReactNode;
  afterActionType?: 'reload' | 'goback' | 'none';
  showType?: 'badge' | 'tag' | 'string';
  disabled?: boolean;
}) => {
  const { actionRef, columnData, url: tableUrl } = useContext(SaContext);
  const { modalApi, messageApi } = useContext(SaDevContext);
  const {
    fieldNames = 'value,label',
    modelName = '',
    url = tableUrl, //默认当前table的url
    value,
    data = {},
    id = 0,
    callback,
    afterActionType,
    showType = 'badge',
    disabled = false,
  } = props;

  const [key = 'value', label = 'label'] = fieldNames.split(',');

  const dataName = modelName + 's';

  //const items_length = columnData?.[dataName]?.length;

  const getLabel = (v: any, type = showType) => {
    if (type == 'tag') {
      return (
        <Tag color={v.color} icon={v.icon ? iconToElement(v.icon) : false} bordered={false}>
          {v[label]}
        </Tag>
      );
    } else if (type == 'badge') {
      const badge_status = v.status ? v.status : v[key] ? 'success' : 'error';
      return <Badge status={badge_status} text={v[label]} />;
    } else {
      return v[label];
    }
  };

  const dropdown_items = columnData?.[dataName]?.map((v: any) => {
    return { key: v[key], label: getLabel(v), v };
  });
  //console.log(dropdown_items, columnData, item.request);
  //如果返回的dom是text的话那么检测状态加入 badge
  //let showDom = dom;
  const selectItem = dropdown_items?.find((v: any) => v.key == value);

  const post_key_name = modelName ? modelName : 'key';
  let requestUrl = url;
  if (requestUrl == '{{url}}') {
    requestUrl = tableUrl;
  }
  return (
    <Dropdown
      key={key}
      trigger={['click']}
      disabled={disabled}
      menu={{
        items: dropdown_items,
        onClick: (event) => {
          //console.log(event.item);
          const clickItem = dropdown_items.find((v: any) => v.key == event.key);
          const postData = { [post_key_name]: event.key, ...data };
          modalApi?.confirm(
            ConfirmTriggerClick(
              {
                data: { ...postData, base: { ...postData } },
                url: requestUrl,
                dataId: id,
                msg: (
                  <Space>
                    确定要执行
                    <span style={{ color: 'red' }}>{clickItem?.label}</span>
                    操作吗？
                  </Space>
                ),
                callback,
                afterActionType,
              },
              actionRef,
              null,
              messageApi,
            ),
          );
        },
      }}
      arrow
    >
      <a>{showType == 'badge' ? selectItem?.label : getLabel(selectItem.v, 'tag')}</a>
    </Dropdown>
  );
};

export const DropdownActionRel = (props) => {
  return <DropdownAction {...props} />;
};

export const DropdownActionMap = (_, props) => {
  const { fieldProps, record } = props;
  const { dataindex } = fieldProps;
  return <DropdownActionRel {...fieldProps} modelName={dataindex} value={_} id={record?.id} />;
};

export default DropdownAction;
