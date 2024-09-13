import { saFormColumnsType } from '@/components/Sadmin/helpers';
import { useContext, useRef, useState } from 'react';
import { SaDevContext } from '../..';
import request from '@/components/Sadmin/lib/request';
import { Button, Input, Space } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';
import { SaContext } from '@/components/Sadmin/posts/table';

export const SchemaToJsonButton = (props) => {
  const { formRef } = useContext(SaContext);
  const [schemaloading, setSchemaloading] = useState(false);
  const { messageApi } = useContext(SaDevContext);
  const [name, setName] = useState<string>();

  const setTableColumns = (type: string) => {
    //console.log(type);
    const cateColumns = [
      { title: 'id', name: 'id', type: 'int' },
      { title: '名称', name: 'title', type: 'vachar' },
      { title: '描述', name: 'desc', type: 'vachar', form_type: 'textarea' },
      { title: '颜色', name: 'color', type: 'vachar', form_type: 'colorPicker' },
      { title: 'Icon', name: 'icon', type: 'vachar', form_type: 'iconSelect' },
      { title: '父级Id', name: 'parent_id', type: 'int', desc: '' },
      {
        title: '图片',
        name: 'titlepic',
        type: 'vachar',
        form_type: 'image',
        setting: {
          image_count: 1,
        },
      },
      {
        title: '状态',
        name: 'state',
        type: 'int',
        form_type: 'switch',
        default: 1,
        setting: {
          open: '启用',
          close: '禁用',
        },
      },
    ];

    const normalColumns = [
      { title: 'id', name: 'id', type: 'int' },
      { title: '名称', name: 'title', type: 'vachar' },
      {
        title: '图片',
        name: 'titlepic',
        type: 'vachar',
        form_type: 'image',
        setting: {
          image_count: 1,
        },
      },
      { title: '描述', name: 'desc', type: 'vachar', form_type: 'textarea' },
      {
        title: '状态',
        name: 'state',
        type: 'int',
        form_type: 'switch',
        default: 1,
        setting: {
          open: '启用',
          close: '禁用',
        },
        table_menu: true,
      },
    ];
    clickSetColumns(type == 'category' ? [...cateColumns] : [...normalColumns]);
  };

  const click = async () => {
    const parent_id = formRef?.current?.getFieldValue('parent_id');

    if (!name) {
      messageApi?.error('请输入检测表名');
      return;
    }
    setSchemaloading(true);
    const { code, data } = await request.get('dev/model/getJsonFromTable', {
      params: { name, parent_id },
    });
    setSchemaloading(false);
    if (!code) {
      clickSetColumns([...data]);
    }
  };
  const clickSetColumns = (v: any) => {
    formRef.current?.setFieldsValue({
      columns: v,
      search_columns: [],
    });
  };
  return (
    <Space>
      <Button
        onClick={() => setTableColumns('category')}
        size="small"
        icon={<PlusCircleOutlined />}
        key="category"
        type="text"
      >
        分类模型结构
      </Button>
      <Button
        onClick={() => setTableColumns('normal')}
        size="small"
        icon={<PlusCircleOutlined />}
        key="normal"
        type="text"
      >
        普通模型结构
      </Button>
      <Button
        loading={schemaloading}
        onClick={click}
        size="small"
        icon={<PlusCircleOutlined />}
        key="schema"
        type="text"
      >
        通过已存在表生成
      </Button>
      <Input placeholder="请输入检测表名" onChange={(v) => setName(v.target.value)} allowClear />
    </Space>
  );
};

const schemaType = [
  { label: 'int-整型', value: 'int' },
  { label: 'varchar-字符', value: 'varchar' },
  { label: 'datetime-时间', value: 'datetime' },
  { label: 'date-日期', value: 'date' },
  { label: 'text-文本', value: 'text' },
  { label: 'bigint-长整数', value: 'bigint' },
  { label: 'longtext-长Text', value: 'longtext' },
  { label: 'enum - 枚举', value: 'enum' },
];
const formType = [
  { label: '搜索下拉 - search_select', value: 'search_select' },
  { label: '下拉选择- select', value: 'select' },
  { label: '单选按钮 - radioButton', value: 'radioButton' },
  { label: '下拉多选 -selects', value: 'selects' },
  { label: '图片上传 - image', value: 'image' },
  { label: '文件上传 - file', value: 'file' },
  { label: '阿里云视频上传 - aliyunVideo', value: 'aliyunVideo' },
  { label: '密码 - password', value: 'password' },
  { label: '文本域 - textarea', value: 'textarea' },
  { label: '开关 - switch', value: 'switch' },
  { label: '时间 - datetime', value: 'datetime' },
  { label: '日期 - date', value: 'date' },
  { label: 'Time - time', value: 'time' },
  { label: '层级多选 - cascaders', value: 'cascaders' },
  { label: '层级选择 - cascader', value: 'cascader' },
  { label: '省市区 - pca', value: 'pca' },
  { label: '地图组件 - tmapInput', value: 'tmapInput' },
  { label: '地图组件 - bmapInput', value: 'bmapInput' },
  { label: '富文本 - tinyEditor', value: 'tinyEditor' },
  { label: '价格2- price', value: 'price' },
  { label: '价格3- mprice', value: 'mprice' },
  { label: '价格4- mmprice', value: 'mmprice' },
  { label: '数字- digit', value: 'digit' },
  { label: 'json', value: 'json' },
  { label: '弹层选择 - modalSelect', value: 'modalSelect' },
  { label: '拾色器 - colorPicker', value: 'colorPicker' },
  { label: '图标选择器 - iconSelect', value: 'iconSelect' },
];
const fieldColumns: saFormColumnsType = [
  {
    title: '快捷操作',
    readonly: true,
    render: () => <SchemaToJsonButton />,
  },
  {
    title: '字段详情',
    valueType: 'formList',
    dataIndex: 'columns',
    columns: [
      {
        valueType: 'group',
        columns: [
          {
            title: '可为空',
            dataIndex: 'empty',
            valueType: 'checkbox',
            fieldProps: {
              options: [{ label: '允许空值', value: 1 }],
            },
            colProps: { span: 2 },
          },
          {
            title: '名称',
            dataIndex: 'title',
            colProps: { span: 3 },
            fieldProps: {
              placeholder: '名称备注',
            },
          },
          {
            title: '字段',
            dataIndex: 'name',
            colProps: { span: 2 },
            fieldProps: {
              placeholder: '字段名',
            },
          },
          {
            title: '类型',
            dataIndex: 'type',
            valueType: 'select',
            tooltip: '如果选择枚举类型，需要在字段配置中配置json可选数据，第一个为默认值',
            colProps: { span: 3 },
            fieldProps: { options: schemaType },
          },
          {
            title: '默认值',
            dataIndex: 'default',
            colProps: { span: 2 },
            fieldProps: {
              placeholder: '默认值',
            },
          },
          {
            title: '长度',
            dataIndex: 'length',
            colProps: { span: 2 },
            fieldProps: {
              placeholder: '字段长度',
            },
          },
          {
            title: '备注',
            dataIndex: 'desc',
            colProps: { span: 2 },
            fieldProps: {
              placeholder: '默认名称为备注',
            },
          },
          {
            title: 'form类型',
            dataIndex: 'form_type',
            valueType: 'select',
            colProps: { span: 4 },
            fieldProps: { options: formType, showSearch: true },
          },
          {
            title: '配置',
            dataIndex: 'setting',
            valueType: 'confirmForm',
            colProps: { span: 2 },
            fieldProps: {
              btn: { title: '配置' },
              saFormProps: {
                devEnable: false,
              },
              formColumns: [
                {
                  valueType: 'group',
                  columns: [
                    {
                      title: '图片或视频数量限制',
                      dataIndex: 'image_count',
                      colProps: { span: 8 },
                    },
                    { title: '省市区层级', dataIndex: 'pca_level', colProps: { span: 8 } },
                    {
                      title: '省市区前缀',
                      dataIndex: 'pca_topCode',
                      tooltip: '限定上级省市显示，逗号分割',
                      colProps: { span: 8 },
                    },
                  ],
                },
                {
                  valueType: 'group',
                  columns: [
                    {
                      title: 'label',
                      dataIndex: 'label',
                      tooltip: '默认为id',
                      colProps: { span: 8 },
                    },
                    {
                      title: 'value',
                      dataIndex: 'value',
                      tooltip: '默认为title',
                      colProps: { span: 8 },
                    },
                    { title: 'children', dataIndex: 'children', colProps: { span: 8 } },
                  ],
                },
                {
                  valueType: 'group',
                  columns: [
                    { title: 'swtich开启', dataIndex: 'open', colProps: { span: 8 } },
                    { title: 'swtich关闭', dataIndex: 'close', colProps: { span: 8 } },
                  ],
                },
                {
                  title: 'json可选数据',
                  dataIndex: 'json',
                  valueType: 'formList',
                  rowProps: {
                    gutter: 0,
                  },
                  columns: [
                    {
                      valueType: 'group',
                      columns: [
                        { title: 'Value - id', dataIndex: 'id', colProps: { span: 6 } },
                        {
                          title: 'Label - title',
                          dataIndex: 'title',
                          colProps: { span: 6 },
                        },
                        {
                          title: 'Icon',
                          dataIndex: 'icon',
                          valueType: 'iconSelect',
                          colProps: { span: 6 },
                        },
                        {
                          title: 'Color',
                          dataIndex: 'color',
                          valueType: 'colorPicker',
                          colProps: { span: 6 },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          },
          {
            dataIndex: 'table_menu',
            valueType: 'switch',
            title: '菜单',
            colProps: { span: 2 },
            fieldProps: {
              checkedChildren: 'tab',
              unCheckedChildren: 'tab',
              defaultChecked: false,
            },
          },
        ],
      },
    ],
  },
];

export default fieldColumns;
