import { saFormColumnsType, tplComplie, uid } from '@/components/Sadmin/helpers';
import Category from '@/components/Sadmin/posts/category';
import { iconToElement } from '@/components/Sadmin/valueTypeMap/iconSelect';
import { CopyOutlined, RollbackOutlined } from '@ant-design/icons';
import { ActionType } from '@ant-design/pro-components';
import { useIntl, useModel } from '@umijs/max';
import { Space } from 'antd';
import { useRef, useContext } from 'react';
import MenuConfig, { MenuOther } from './menuConfig';
import MenuTable from './menuTable';
import { SaDevContext } from '@/components/Sadmin/dev';
import request, { currentUser, messageLoadingKey } from '@/services/ant-design-pro/sadmin';

export const MenuFormColumn: saFormColumnsType = [
  {
    valueType: 'group',
    columns: [
      {
        title: '菜单名称',
        dataIndex: 'title',
        width: 'md',
        fieldProps: { placeholder: '为空时菜单会隐藏' },
        formItemProps: {
          rules: [
            {
              required: true,
            },
          ],
        },
      },
      {
        title: 'path',
        dataIndex: 'path',
        width: 'sm',
        fieldProps: { placeholder: '请输入路径' },
      },
      {
        title: '图标',
        dataIndex: 'icon',
        valueType: 'iconSelect',
        fieldProps: {
          width: 200,
          placeholder: '请选择图标',
        },
      },
      {
        title: '菜单类型',
        dataIndex: 'type',
        valueType: 'select',
        requestDataName: 'types',
        width: 'sm',
        formItemProps: {
          rules: [
            {
              required: true,
            },
          ],
        },
      },
      {
        title: '新增按钮',
        dataIndex: 'addable',
        valueType: 'switch',
        tooltip: '开启后列表中无新建按钮',
        fieldProps: {
          checkedChildren: '显示',
          unCheckedChildren: '隐藏',
          defaultChecked: true,
        },
      },
      {
        title: 'form是否可编辑',
        dataIndex: 'editable',
        valueType: 'switch',
        tooltip: '开启后表单无提交按钮',
        fieldProps: {
          checkedChildren: '可编辑',
          unCheckedChildren: '只读',
          defaultChecked: true,
        },
      },
      {
        title: '是否可删除',
        dataIndex: 'deleteable',
        valueType: 'switch',
        tooltip: '数据是否可以删除',
        fieldProps: {
          checkedChildren: '可删除',
          unCheckedChildren: '不可删',
          defaultChecked: true,
        },
      },
    ],
  },
  {
    valueType: 'group',
    columns: [
      {
        dataIndex: 'admin_model_id',
        title: '关联模型',
        valueType: 'treeSelect',
        requestDataName: 'admin_model_ids',
        fieldProps: {
          treeLine: { showLeafIcon: true },
          treeDefaultExpandAll: true,
          allowClear: true,
        },
        width: 'md',
      },
      {
        title: '上级菜单',
        dataIndex: 'parent_id',
        valueType: 'treeSelect',
        requestDataName: 'menus',
        fieldProps: {
          treeLine: { showLeafIcon: true },
          treeDefaultExpandAll: true,
          allowClear: true,
        },
        width: 'sm',
      },
      {
        title: '页面类型',
        dataIndex: 'page_type',
        valueType: 'select',
        fieldProps: {
          options: [
            { label: '列表 - 整个resource', value: 'table' },
            { label: '分类', value: 'category' },
            { label: '表单', value: 'form' },
            { label: '面板 - 将移除', value: 'panel' },
            { label: '面板2', value: 'panel2' },
            { label: '仅列表 - 指向控制器方法', value: 'justTable' },
          ],
        },
        width: 'sm',
      },
      {
        title: 'form打开方式',
        dataIndex: 'open_type',
        valueType: 'radioButton',
        fieldProps: {
          options: [
            { label: 'page', value: 'page' },
            { label: 'drawer', value: 'drawer' },
            { label: 'modal', value: 'modal' },
          ],
        },
      },
      {
        title: '启用',
        dataIndex: 'state',
        valueType: 'switch',
        fieldProps: {
          checkedChildren: '启用',
          unCheckedChildren: '禁用',
          defaultChecked: true,
        },
      },
      {
        title: '显示',
        dataIndex: 'status',
        valueType: 'switch',
        tooltip: '隐藏后菜单不显示，但还是可以访问',
        fieldProps: {
          checkedChildren: '显示',
          unCheckedChildren: '隐藏',
          defaultChecked: true,
        },
      },
      {
        title: '设置',
        dataIndex: 'setting',
        valueType: 'confirmForm',
        fieldProps: {
          btn: {
            title: '设置',
            size: 'middle',
          },
          saFormProps: {
            devEnable: false,
          },
          formColumns: [
            {
              valueType: 'group',
              title: '表格设置',
              columns: [
                {
                  dataIndex: ['table', 'scroll', 'y'],
                  title: '滚动高度',
                  valueType: 'digit',
                  width: '100%',
                  colProps: { span: 12 },
                },
                {
                  dataIndex: ['table', 'scroll', 'x'],
                  title: '滚动宽度',
                  valueType: 'digit',
                  width: '100%',
                  colProps: { span: 12 },
                },
                {
                  dataIndex: ['table', 'size'],
                  title: '尺寸',
                  valueType: 'radioButton',
                  fieldProps: {
                    buttonStyle: 'solid',
                    defaultValue: 'middle',
                    options: [
                      { label: 'large', value: 'large' },
                      { label: 'middle', value: 'middle' },
                      { label: 'small', value: 'small' },
                    ],
                  },
                  colProps: { span: 12 },
                },
              ],
            },
            {
              valueType: 'group',
              title: '分页设置',
              columns: [
                {
                  dataIndex: ['pagination', 'pageSize'],
                  title: '分页数量',
                  valueType: 'digit',
                  fieldProps: {
                    defaultValue: 20,
                  },
                  width: '100%',
                  colProps: { span: 12 },
                },
                {
                  dataIndex: ['pagination', 'showQuickJumper'],
                  title: '快速跳转',
                  valueType: 'switch',
                  fieldProps: {
                    defaultValue: true,
                  },
                  colProps: { span: 12 },
                },
              ],
            },
            {
              valueType: 'group',
              title: '表单设置',
              columns: [
                {
                  dataIndex: 'formWidth',
                  title: '宽度',
                  valueType: 'digit',
                  width: '100%',
                  colProps: { span: 12 },
                },
                {
                  dataIndex: 'steps_form',
                  title: '分步表单',
                  valueType: 'switch',
                  colProps: { span: 12 },
                },
                {
                  dataIndex: ['form', 'layout'],
                  title: '标签布局',
                  valueType: 'radioButton',
                  fieldProps: {
                    buttonStyle: 'solid',
                    defaultValue: 'vertical',
                    options: [
                      { label: 'horizontal', value: 'horizontal' },
                      { label: 'vertical', value: 'vertical' },
                      { label: 'inline', value: 'inline' },
                    ],
                  },
                  colProps: { span: 12 },
                },
                {
                  dataIndex: ['form', 'variant'],
                  title: 'variant',
                  valueType: 'radioButton',
                  fieldProps: {
                    buttonStyle: 'solid',
                    defaultValue: 'filled',
                    options: [
                      { label: 'outlined', value: 'outlined' },
                      { label: 'borderless', value: 'borderless' },
                      { label: 'filled', value: 'filled' },
                    ],
                  },
                  colProps: { span: 12 },
                },
              ],
            },
            {
              valueType: 'group',
              title: '分类设置',
              columns: [
                {
                  dataIndex: 'level',
                  title: '层级',
                  colProps: { span: 12 },
                },
                {
                  dataIndex: 'fold',
                  title: '是否收缩',
                  valueType: 'switch',
                  colProps: { span: 12 },
                },
              ],
            },
            {
              valueType: 'group',
              title: '其它设置',
              columns: [
                {
                  dataIndex: 'show_selectbar',
                  title: '选择操作栏',
                  valueType: 'switch',
                  colProps: { span: 12 },
                  fieldProps: {
                    defaultValue: true,
                  },
                },
              ],
            },
          ],
        },
      },
    ],
  },

  // {
  //   title: 'router',
  //   dataIndex: 'router',
  //   fieldProps: { placeholder: '请输入router' },
  // },

  {
    title: '属性设置',
    dataIndex: 'desc',
    valueType: 'jsonEditor',
    fieldProps: { height: 600 },
  },
  { title: '子权限', dataIndex: 'perms', valueType: 'jsonEditor' },
];

export default () => {
  const actionRef = useRef<ActionType>();
  const { messageApi } = useContext(SaDevContext);
  const { setInitialState } = useModel('@@initialState');
  const reload = async () => {
    messageApi?.loading({ key: messageLoadingKey, content: 'loading...' });
    const msg = await currentUser();
    //const msg = await cuser();
    await request.get('dev/menu/clearCache');
    const uidx = uid();
    setInitialState((s) => ({
      ...s,
      currentUser: { ...msg.data, uidx },
    })).then(() => {
      messageApi?.success({ key: messageLoadingKey, content: '刷新成功' });
    });
    return;
  };

  const tableColumns = (enums) => [
    {
      title: '菜单名称',
      dataIndex: 'title2',
      key: 'title2',
      render: (dom, record) => (
        <Space>
          {iconToElement(record.icon)}
          {tplComplie(record.title)}
        </Space>
      ),
    },
    {
      title: 'path',
      dataIndex: 'path',
      key: 'path',
    },
    'displayorder',
    {
      title: '配置',
      dataIndex: 'type',
      valueType: 'customerColumn',
      search: false,
      readonly: true,
      width: 300,
      fieldProps: {
        items: [
          {
            domtype: 'button',
            modal: {
              title: '{{record.title + " - 列表配置"}}',
              drawerProps: {
                width: 1600,
              },
              childrenRender: (record) => <MenuTable model={record} actionRef={actionRef} />,
            },
            action: 'drawer',
            btn: { text: '列表', size: 'small' },
          },
          {
            domtype: 'button',
            modal: {
              title: '{{record.title + " - 表单配置"}}',
              drawerProps: {
                width: 1310,
              },
              childrenRender: (record) => <MenuConfig model={record} actionRef={actionRef} />,
            },
            action: 'drawer',
            btn: { text: '表单', size: 'small' },
          },
          {
            domtype: 'button',
            modal: {
              title: '{{record.title + " - 其它配置"}}',
              drawerProps: {
                width: 1600,
              },
              childrenRender: (record) => (
                <MenuOther model={{ id: record?.id }} actionRef={actionRef} />
              ),
            },
            action: 'drawer',
            btn: { text: '其它', size: 'small' },
          },
          {
            domtype: 'button',
            modal: {
              msg: '请选择复制到',
              formColumns: [
                {
                  dataIndex: 'toid',
                  width: 'md',
                  title: '复制到',
                  valueType: 'treeSelect',
                  fieldProps: {
                    options: enums?.menus,
                    treeLine: { showLeafIcon: true },
                    treeDefaultExpandAll: true,
                  },
                },
              ],
            },
            request: { url: 'dev/menu/copyTo' },
            action: 'confirmForm',
            // btn: (
            //   <Tooltip title="复制模型">
            //     <Button size="small" icon={<CopyOutlined />} />
            //   </Tooltip>
            // ),
            btn: { text: '', size: 'small', icon: <CopyOutlined />, tooltip: '复制' },
          },
          {
            domtype: 'button',
            modal: {
              msg: '请选择移动到',
              formColumns: [
                {
                  dataIndex: 'toid',
                  width: 'md',
                  title: '移动到',
                  valueType: 'treeSelect',
                  fieldProps: {
                    options: enums?.menus,
                    treeLine: { showLeafIcon: true },
                    treeDefaultExpandAll: true,
                  },
                },
              ],
            },
            request: { postUrl: 'dev/menu/moveTo' },
            action: 'confirmForm',
            // btn: (
            //   <Tooltip title="复制模型">
            //     <Button size="small" icon={<CopyOutlined />} />
            //   </Tooltip>
            // ),
            btn: { text: '', size: 'small', icon: <RollbackOutlined />, tooltip: '移动至' },
          },
        ],
      },
    },
    //'state',
    {
      dataIndex: 'state',
      title: '状态',
      valueType: 'customerColumn',
      search: false,
      readonly: true,
      fieldProps: {
        items: [
          {
            domtype: 'text',
            action: 'dropdown',
            request: {
              url: '{{url}}',
              modelName: 'state',
              fieldNames: 'value,label',
              data: {
                actype: 'state',
              },
              callback: async (ret) => {
                await reload();
                return;
              },
            },
          },
        ],
      },
    },
    {
      dataIndex: 'status',
      title: '显示',
      valueType: 'select',
      search: false,
      valueEnum: [
        { text: '隐藏', status: 'error' },
        { text: '显示', status: 'success' },
      ],
    },
    'option',
  ];

  return (
    <Category
      name="菜单"
      title={false}
      actionRef={actionRef}
      table_menu_key="state"
      table_menu_all={false}
      tableColumns={tableColumns}
      toolBarButton={[
        {
          valueType: 'export',
        },
        {
          valueType: 'import',
          uploadProps: {
            accept: '.sql',
          },
        },
        {
          valueType: 'toolbar',
          fieldProps: {
            items: [
              {
                domtype: 'button',
                btn: {
                  text: '生成配置',
                },
                action: 'confirm',
                request: {
                  url: 'dev/menu/remenu',
                },
                modal: {
                  msg: '确定要重新生成配置吗？',
                },
              },
            ],
          },
        },
      ]}
      formColumns={MenuFormColumn}
      expandAll={false}
      level={4}
      openWidth={1600}
      tableProps={{
        scroll: { y: 600 },
      }}
      afterFormPost={reload}
      afterDelete={reload}
      url="dev/menu"
      grid={false}
      devEnable={false}
    />
  );
};
