import ButtonDrawer from '@/components/Sadmin/action/buttonDrawer';
import { getJson, isStr } from '@/components/Sadmin/checkers';
import TranslationModal from '@/components/Sadmin/dev/form/translation';
import type { saFormColumnsType } from '@/components/Sadmin/helpers';
import { getFromObject, uid } from '@/components/Sadmin/helpers';
import Uploader from '@/components/Sadmin/uploader';
import {
  DoubleRightOutlined,
  PlusCircleOutlined,
  SettingOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import type { EditableFormInstance, ProFormInstance } from '@ant-design/pro-components';
import {
  EditableProTable,
  ProCard,
  ProForm,
  ProFormDigit,
  ProFormList,
  ProFormText,
} from '@ant-design/pro-components';
import { Button, Flex, Input, InputNumber, Space, Switch, Tooltip } from 'antd';
import type { FC } from 'react';
import React, { useEffect, useRef, useState } from 'react';
const getData = (attributes: any[], values: any) => {
  const tableRows: any[] = [];
  const editableKeys: React.Key[] = [];
  const data: any[] = [];
  let table = [[]];
  attributes?.forEach((attr) => {
    const temp: any[] = [];
    attr.items?.forEach((row) => {
      const rowId = uid();

      temp.push({ id: row.id ? row.id : rowId, ...row, group: attr.id });
    });
    data.push(temp);
  });
  data.forEach(function (rows) {
    const temp: any[] = [];
    table.forEach(function (line) {
      rows.forEach(function (item) {
        temp.push(line.concat(item));
      });
    });
    table = temp;
  });
  table.forEach((rowField) => {
    const item = {};
    const rowId = [];
    rowField.forEach((f) => {
      item[f.group] = f.name;
      //log('set feild', f);
      rowId.push(f.id);
    });
    const nowId = rowId.join(':');
    //检测是否有值了
    const hasValue = values?.find((v) => v.id == nowId);
    tableRows.push({
      ...hasValue,
      ...item,
      id: nowId,
    });
    editableKeys.push(nowId);
  });

  return [tableRows, editableKeys];
};

const columnsName: {
  title: string;
  name: string;
  required?: boolean;
  prefix?: string;
  valueType?: string;
}[] = [
  { title: '价格', name: 'price', valueType: 'digit', required: true, prefix: '￥' },
  { title: '库存', name: 'sku', valueType: 'digit', required: true, prefix: '' },
  { title: '市场价', name: 'old_price', valueType: 'digit', prefix: '￥' },
  { title: '结算价', name: 'jiesuan_price', valueType: 'digit', prefix: '￥' },
  { title: '成本价', name: 'chengben_price', valueType: 'digit', prefix: '￥' },
  { title: '每次最大购买', name: 'max', valueType: 'digit', prefix: '' },
];

const PiliangInput = (props) => {
  const { name, action, type } = props;
  const [value, setValue] = useState<any>();
  const addonAfter = (
    <Button
      size="small"
      onClick={() => {
        //log('pliang value', piliang);
        action(name, value);
      }}
      color="default"
      variant="filled"
      icon={<DoubleRightOutlined rotate={90} title="批量设置" />}
    />
  );
  return (
    <Space.Compact>
      {type == 'digit' ? (
        <InputNumber
          style={{ width: '100%' }}
          size="small"
          onChange={(v) => {
            setValue(v);
          }}
          variant="filled"
        />
      ) : (
        <Input
          style={{ width: '100%' }}
          size="small"
          onChange={(v) => {
            setValue(v.target.value);
          }}
          variant="filled"
        />
      )}
      {addonAfter}
    </Space.Compact>
  );
};

const getColumnsName = (_columns: Array<any>) => {
  let _columnsName = [];
  if (_columns.length == 0) {
    //默认全部字段都选择
    _columnsName = columnsName;
  } else {
    _columnsName = _columns
      .map((item) => {
        if (isStr(item)) {
          //读取预设置的字段
          return columnsName.find((v) => v.name == item) || item;
        } else {
          //自定义字段
          return item;
        }
      })
      .filter((v) => v);
  }
  return _columnsName;
};

const getColumns = (
  attributes: any[],
  piliangAction: (value: string, v: number) => void,
  _columnsName: any[] = [],
) => {
  const columns: any[] = [];
  attributes?.forEach((attr) => {
    columns.push({
      title: attr.name,
      dataIndex: attr.id,
      readonly: true,
    });
  });
  const titlepicIndex = _columnsName.findIndex((v) => v == 'titlepic');
  if (titlepicIndex != -1) {
    columns.push({
      title: '图片',
      dataIndex: 'titlepic',
      valueType: 'uploader',
      fieldProps: {
        buttonType: 'table',
      },
    });
  }

  const normalColumns: saFormColumnsType = _columnsName
    .map((item) => {
      if (isStr(item)) {
        return null;
      } else {
        return {
          title: (
            <Space direction="vertical">
              {item.tooltip ? <Tooltip title={item.tooltip}>{item.title}</Tooltip> : item.title}
              <PiliangInput name={item.name} type={item.valueType} action={piliangAction} />
            </Space>
          ),
          dataIndex: item.name,
          valueType: item.valueType,
          fieldProps: { prefix: item.prefix, style: { width: '100%' }, variant: 'filled' },
          // React.Fragment 的属性错误 react 19
          formItemProps: item.required
            ? {
                rules: [
                  {
                    required: true,
                    message: '此项必填',
                  },
                ],
              }
            : false,
        };
      }
    })
    .filter((v) => v);

  return columns.concat(normalColumns);
};

const GuigeTable: FC<{
  formRef?: any;
  tableForm?: any;
  isSync?: number;
  columns?: any[]; //自定义列表字段设置
}> = (props) => {
  const { isSync, formRef, tableForm, columns: ccolumns = [] } = props;
  const [editableKeys, setEditableKeys] = useState([]);
  //const [tableRows, editableKeys] = getData(items, formRef?.current?.getFieldValue('attrs'));
  const [datas, setDatas] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const getGuiges = (value: any) => {
    setDatas([...value]);
    //console.log('form set value', value, datas);
    formRef?.current?.setFieldValue('attrs', value);
  };

  const parseTable = (setValue?: boolean) => {
    const attrs = formRef.current?.getFieldValue('attrs');
    const items = formRef.current?.getFieldValue('items');
    //console.log('form get attrs and items are', attrs, items);
    const [_datas, _editableKeys] = getData(items, attrs);
    setDatas([..._datas]);
    setEditableKeys([..._editableKeys]);
    formRef.current?.setFieldValue('attrs', [..._datas]);
  };

  useEffect(() => {
    if (isSync) {
      //手动更新 必定有form
      parseTable(true);
    } else {
      if (formRef.current) {
        //初始化 如果form已经有了  才初始化
        parseTable();
      }
    }
  }, [isSync, formRef]);

  useEffect(() => {
    //console.log('now datas is ', datas);
    if (datas.length > 0) {
      const items = formRef.current?.getFieldValue('items');
      setColumns(
        getColumns(
          items,
          (name: string, value: number) => {
            //console.log('old data', datas, name, value, columns);
            datas?.forEach((v) => {
              v[name] = value;
            });
            getGuiges([...datas]);
          },
          getColumnsName(ccolumns),
        ),
      );
    }
  }, [datas]);
  return (
    <EditableProTable
      columns={columns}
      value={datas}
      onChange={(v) => {
        getGuiges([...v]);
      }}
      controlled={true}
      rowKey="id"
      editable={{
        type: 'multiple',
        editableKeys,
        onValuesChange: (record, recordList) => {
          //console.log('onValuesChange', recordList);
          getGuiges([...recordList]);
        },
      }}
      recordCreatorProps={false}
      editableFormRef={tableForm}
    />
  );
};

const DraggableItem = (props) => {
  const { action, localesopen, itemImg } = props;

  const changeData = (v) => {
    const old = action?.getCurrentRowData();
    const newval = { ...old, ...v };
    action?.setCurrentRowData?.({ ...newval });
  };
  return (
    <Flex gap="small">
      <ProFormText allowClear={false} width="xs" rules={[{ required: true }]} name={['name']} />
      {itemImg && (
        <Uploader
          buttonType="table"
          value={action?.getCurrentRowData()?.titlepic}
          onChange={(v) => {
            changeData({ titlepic: v });
          }}
        />
      )}
      {localesopen && (
        <div style={{ height: 32, marginBlockEnd: '24px', lineHeight: '36px' }}>
          <div
            style={{
              padding: 4,
              borderRadius: 6,
              fontSize: 14,
              display: 'inline-flex',
            }}
            className="guigehandle"
          >
            <TranslationModal
              onChange={(values) => {
                changeData(values);
              }}
              column={{ title: '规格名', dataIndex: 'name' }}
              values={action?.getCurrentRowData()}
            />
          </div>
        </div>
      )}
    </Flex>
  );
};

const GuigeItems = ({
  localesopen = false,
  itemImg = false,
}: {
  localesopen?: boolean;
  itemImg?: boolean;
}) => {
  return (
    <ProFormList
      label="规格值"
      name="items"
      creatorRecord={() => ({ name: '', id: uid() })}
      creatorButtonProps={{
        creatorButtonText: '新建',
        icon: <PlusCircleOutlined />,
        type: 'link',
        style: { width: 'unset' },
      }}
      min={1}
      copyIconProps={false}
      deleteIconProps={{ tooltipText: '删除' }}
      itemRender={({ listDom, action }) => (
        <div
          style={{
            display: 'inline-flex',
            marginInlineEnd: 25,
          }}
        >
          {listDom}
          {action}
        </div>
      )}
      arrowSort={true}
    >
      {(f, index, inneraction) => {
        return <DraggableItem action={inneraction} localesopen={localesopen} itemImg={itemImg} />;
      }}
    </ProFormList>
  );
};

const GuigePanel: FC<{
  value?: any;
  contentRender?: any;
  setOpen?: any;
  onChange?: any;
  columns?: any[];
  localesopen?: boolean; //是否开启多语言
  itemImg?: boolean; //规格名称是否开启图片
}> = (props) => {
  const {
    value,
    contentRender,
    setOpen,
    onChange,
    columns = [],
    localesopen = false,
    itemImg = false,
  } = props;
  const formRef = useRef<ProFormInstance<any>>();
  const tableForm = useRef<EditableFormInstance>();
  const [isSync, setIsSync] = useState(0);

  return (
    <ProForm
      variant="filled"
      formRef={formRef}
      initialValues={value}
      contentRender={contentRender}
      submitter={{
        searchConfig: { resetText: '取消' },
        resetButtonProps: {
          onClick: () => {
            setOpen?.(false);
          },
        },
      }}
      onFinish={async (v) => {
        try {
          await tableForm.current?.validateFields();
        } catch (errorInfo) {
          return;
        }
        //这里将未设置的值过滤掉

        const items = [];
        const attrs = [];
        const items_id = [];
        v.items.forEach((item) => {
          if (item.name) {
            const _items = [];
            item.items.forEach((_item) => {
              if (_item.name) {
                _items.push(_item);
              }
            });
            if (_items.length > 0) {
              item.items = _items;
              items_id.push(item.id);
              items.push(item);
            }
          }
        });

        v.attrs.forEach((attr) => {
          let no_name = false;
          items_id.forEach((id) => {
            if (!attr[id] && !attr.id) {
              //没有规格值的时候 不会将数据加入
              //console.log('noname is ', id);
              no_name = true;
            } else {
              //有数据 先将规格id的值删掉，后台直接自动读取规格属性值
              delete attr[id];
            }
          });
          if (!no_name) {
            attrs.push(attr);
          }
        });

        //log('items:', items, 'attrs', attrs);
        const newValue = { items, attrs, open: true };
        onChange?.(newValue);
        //console.log('submit here v is ', newValue);
        setOpen(false);
      }}
    >
      <ProFormList
        name="items"
        label="规格属性"
        creatorButtonProps={{
          creatorButtonText: '添加规格项',
        }}
        min={1}
        copyIconProps={false}
        arrowSort={true}
        itemRender={({ listDom, action }, { index }) => (
          <ProCard
            bordered
            style={{ marginBlockEnd: 8 }}
            title={
              <ProFormText
                style={{ padding: 0 }}
                rules={[{ required: true, message: '规格名不能为空' }]}
                width="md"
                name="name"
                label={
                  <Space>
                    规格名
                    {localesopen && (
                      <TranslationModal
                        onChange={(values) => {
                          const oldvalues = formRef?.current?.getFieldValue(['items', index]);
                          const newvalues = { ...oldvalues, ...values };
                          formRef?.current?.setFieldValue(['items', index], newvalues);
                        }}
                        column={{ title: '规格名', dataIndex: 'name' }}
                        values={
                          formRef?.current
                            ? formRef?.current?.getFieldValue(['items', index])
                            : getFromObject(value, ['items', index])
                        }
                      />
                    )}
                  </Space>
                }
              />
            }
            extra={action}
            bodyStyle={{ paddingBlockEnd: 0 }}
          >
            {listDom}
          </ProCard>
        )}
        creatorRecord={() => ({ name: '', items: [{ name: '', id: uid() }], id: uid() })}
        //initialValue={[{ name: '', items: [{ name: '', id: uid() }], id: uid() }]}
      >
        <GuigeItems localesopen={localesopen} itemImg={itemImg} />
      </ProFormList>
      <ProFormText name="attrs" hidden />
      <ProForm.Item
        label={
          <Space>
            <span>规格详情</span>
            <Button
              onClick={() => {
                setIsSync(isSync + 1);
              }}
              icon={<SyncOutlined />}
            >
              同步属性
            </Button>
          </Space>
        }
      >
        <GuigeTable isSync={isSync} formRef={formRef} tableForm={tableForm} columns={columns} />
      </ProForm.Item>
    </ProForm>
  );
};

export const Guiges = (props) => {
  //const [tableFormRef] = Form.useForm();
  const [openValue, setOpenValue] = useState(false);
  const dvalue = { items: [{ name: '', items: [{ name: '', id: uid() }], id: uid() }] };
  const value = getJson(props.value, dvalue);
  //log('inner value is', value);
  const [hidden, setHidden] = useState(value.open ? false : true);
  const { columns = [], locale, itemImg } = props;
  const columnsName = getColumnsName(columns);
  return (
    <>
      {hidden && (
        <ProForm.Group rowProps={{ gutter: 0 }}>
          {columnsName.map((item) => {
            return (
              <ProForm.Item
                key={item.name}
                label={item.title}
                required={item.required}
                tooltip={item.tooltip}
              >
                <ProFormDigit name={item.name} colProps={{ span: 20 }} />
              </ProForm.Item>
            );
          })}
        </ProForm.Group>
      )}
      <ProForm.Item label="开启多规格">
        <Space>
          <Switch
            checked={value.open ? true : false}
            onChange={(v) => {
              setHidden(v ? false : true);
              props.onChange?.({ ...value, open: v });
            }}
          />
          <ButtonDrawer
            trigger={
              <Button icon={<SettingOutlined />} disabled={hidden}>
                点击配置
              </Button>
            }
            afterOpenChange={(open) => {
              setOpenValue(open);
            }}
            open={openValue}
            width={1200}
            title="规格参数设置"
          >
            <GuigePanel
              value={value}
              onChange={props.onChange}
              columns={columns}
              localesopen={locale}
              itemImg={itemImg}
            />
          </ButtonDrawer>
        </Space>
      </ProForm.Item>
    </>
  );
};

export default GuigePanel;
