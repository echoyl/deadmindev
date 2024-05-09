import { Badge, Dropdown, Space } from 'antd';
import React, { useContext } from 'react';
import { SaContext } from '../../posts/table';
import { SaDevContext } from '../../dev';
import { ConfirmTriggerClick } from '../../action/confirm';

const DropdownAction: React.FC = (props: {
  fieldNames?: string;
  modelName?: string;
  url?: string;
  value?: any;
  data?: { [key: string]: any };
  id?: number;
}) => {
  const { actionRef, columnData, url: tableUrl } = useContext(SaContext);
  const { modalApi, messageApi } = useContext(SaDevContext);
  const { fieldNames = 'value,label', modelName = '', url, value, data = {}, id = 0 } = props;

  const [key = 'value', label = 'label'] = fieldNames.split(',');

  const dataName = modelName + 's';

  const items_length = columnData?.[dataName]?.length;
  const dropdown_items = columnData?.[dataName]?.map((v: any) => {
    const badge_status = v.status ? v.status : v[key] ? 'success' : 'error';
    const _label = items_length > 2 ? v[label] : <Badge status={badge_status} text={v[label]} />;
    return { key: v[key], label: _label };
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
      menu={{
        items: dropdown_items,
        onClick: (event) => {
          //console.log(event.item);
          const clickItem = dropdown_items.find((v: any) => v.key == event.key);

          modalApi?.confirm(
            ConfirmTriggerClick(
              {
                data: { [post_key_name]: event.key, ...data },
                url: requestUrl,
                dataId: id,
                msg: (
                  <Space>
                    确定要执行
                    <span style={{ color: 'red' }}>{clickItem?.label}</span>
                    操作吗？
                  </Space>
                ),
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
      <a>{selectItem?.label}</a>
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
