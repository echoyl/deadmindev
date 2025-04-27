import { saFormTabColumnsType, tplComplie, uid } from '@/components/Sadmin/helpers';
import Category from '@/components/Sadmin/posts/category';
import { iconToElement } from '@/components/Sadmin/valueTypeMap/iconSelect';
import { CopyOutlined, EyeOutlined, ImportOutlined, RollbackOutlined } from '@ant-design/icons';
import { ActionType } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Space } from 'antd';
import { useRef, useContext } from 'react';
import { SaDevContext } from '@/components/Sadmin/dev';
import request, { currentUser, messageLoadingKey } from '@/components/Sadmin/lib/request';
import tableSet from '@/components/Sadmin/dev/vars/menu/set';
import TableFromBread from '@/components/Sadmin/tableFromBread';
import FormFromBread from '@/components/Sadmin/formFromBread';

export const MenuFormColumn: saFormTabColumnsType = [
  {
    tab: { title: '基础信息' },
    formColumns: [
      {
        valueType: 'group',
        columns: [
          {
            title: '菜单名称',
            dataIndex: 'title',
            fieldProps: { placeholder: '为空时菜单会隐藏' },
            formItemProps: {
              rules: [
                {
                  required: true,
                },
              ],
            },
            colProps: { span: 12 },
          },
          {
            title: 'path',
            dataIndex: 'path',
            fieldProps: { placeholder: '请输入路径' },
            colProps: { span: 12 },
          },
        ],
      },
      {
        valueType: 'group',
        columns: [
          {
            title: '上级菜单',
            dataIndex: 'parent_id',
            valueType: 'treeSelect',
            requestDataName: 'menus',
            fieldProps: {
              treeLine: { showLeafIcon: true },
              treeDefaultExpandAll: true,
              allowClear: true,
              treeTitleRender: (item) => {
                return item ? (item.label ? tplComplie(item.label) : item.label) : '-';
              },
            },
            colProps: { span: 12 },
          },
          {
            title: '菜单类型',
            dataIndex: 'type',
            valueType: 'select',
            requestDataName: 'types',
            formItemProps: {
              rules: [
                {
                  required: true,
                },
              ],
            },
            colProps: { span: 6 },
          },
          {
            title: '排序',
            dataIndex: 'displayorder',
            valueType: 'digit',
            tooltip: '值越大越靠前',
            width: '100%',
            colProps: { span: 6 },
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
            colProps: { span: 12 },
          },
          {
            title: '图标',
            dataIndex: 'icon',
            valueType: 'iconSelect',
            fieldProps: {
              placeholder: '请选择图标',
            },
            colProps: { span: 12 },
          },
        ],
      },
      {
        valueType: 'group',
        columns: [
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
                { label: 'API - 只使用子权限，无页面使用', value: 'api' },
              ],
              defaultValue: 'table',
            },
            colProps: { span: 12 },
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
              defaultValue: 'page',
            },
            colProps: { span: 12 },
          },
        ],
      },
      {
        valueType: 'group',
        columns: [
          {
            title: '新增按钮',
            dataIndex: 'addable',
            valueType: 'switch',
            tooltip: '关闭后列表中无新建按钮',
            fieldProps: {
              checkedChildren: '显示',
              unCheckedChildren: '隐藏',
              defaultChecked: true,
            },
            colProps: { span: 6 },
          },
          {
            title: 'form是否可编辑',
            dataIndex: 'editable',
            valueType: 'switch',
            tooltip: '关闭后默认option中无编辑项',
            fieldProps: {
              checkedChildren: '可编辑',
              unCheckedChildren: '只读',
              defaultChecked: true,
            },
            colProps: { span: 6 },
          },
          {
            title: '是否可删除',
            dataIndex: 'deleteable',
            valueType: 'switch',
            tooltip: '关闭后默认option中无删除项，勾选操作无批量删除',
            fieldProps: {
              checkedChildren: '可删除',
              unCheckedChildren: '不可删',
              defaultChecked: true,
            },
            colProps: { span: 6 },
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
            colProps: { span: 6 },
          },
        ],
      },
      {
        valueType: 'group',
        columns: [
          {
            title: '启用',
            dataIndex: 'state',
            valueType: 'switch',
            fieldProps: {
              checkedChildren: '启用',
              unCheckedChildren: '禁用',
              defaultChecked: true,
            },
            colProps: { span: 6 },
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
              formColumns: tableSet,
            },
            colProps: { span: 6 },
          },
          {
            dataIndex: 'category_id',
            title: '选择关联内容分类',
            tooltip: '读取已选择模型是否有分类模型，有的话列出该分类模型下的数据选择',
            valueType: 'debounceSelect',
            fieldProps: {
              fetchOptions: 'web/menu/category',
              params: {
                admin_model_id: '{{record.admin_model_id}}',
                pagetype: 'list',
              },
              fieldNames: {
                value: 'id',
                label: 'title',
                children: 'children',
              },
              type: 'cascader',
              changeOnSelect: true,
              placeholder: '请选择关联内容分类',
            },
            dependencyOn: {
              condition: [
                {
                  name: ['admin_model_id'],
                  exp: '{{record.admin_model_id}}',
                },
              ],
            },
            colProps: { span: 12 },
          },
        ],
      },
    ],
  },
  {
    tab: { title: 'JSON配置' },
    formColumns: [
      {
        title: '',
        dataIndex: 'desc',
        valueType: 'jsonEditor',
        fieldProps: { height: 600 },
      },
    ],
  },
  {
    tab: { title: '子权限' },
    formColumns: [{ title: '', dataIndex: 'perms', valueType: 'jsonEditor' }],
  },
  {
    tab: { title: '其它配置' },
    formColumns: [
      {
        title: '',
        dataIndex: 'other_config',
        valueType: 'jsonEditor',
        fieldProps: { height: 600 },
      },
    ],
  },
];

export default () => {
  const actionRef = useRef<ActionType>();
  const { messageApi, setting } = useContext(SaDevContext);
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
  /**复制或移动的表单项 */
  const toFormColumns = [
    {
      dataIndex: 'toid',
      title: '复制到',
      valueType: 'treeSelect',
      fieldProps: {
        requestDataName: 'menus',
        treeLine: { showLeafIcon: true },
        treeDefaultExpandAll: true,
        showSearch: true,
      },
    },
  ];

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
    {
      title: '排序',
      dataIndex: 'displayorder',
      valueType: 'displayorder',
    },
    {
      title: '操作',
      dataIndex: 'type',
      valueType: 'customerColumn',
      search: false,
      readonly: true,
      width: 150,
      fieldProps: {
        items: [
          // {
          //   domtype: 'button',
          //   modal: {
          //     title: '{{record.title + " - 列表配置"}}',
          //     drawerProps: {
          //       width: 1600,
          //     },
          //     childrenRender: (record) => <MenuTable model={record} actionRef={actionRef} />,
          //   },
          //   action: 'drawer',
          //   btn: { text: '列表', size: 'small' },
          // },
          // {
          //   domtype: 'button',
          //   modal: {
          //     title: '{{record.title + " - 表单配置"}}',
          //     drawerProps: {
          //       width: 1310,
          //     },
          //     childrenRender: (record) => <MenuConfig model={record} actionRef={actionRef} />,
          //   },
          //   action: 'drawer',
          //   btn: { text: '表单', size: 'small' },
          // },
          // {
          //   domtype: 'button',
          //   modal: {
          //     title: '{{record.title + " - 其它配置"}}',
          //     drawerProps: {
          //       width: 1600,
          //     },
          //     childrenRender: (record) => (
          //       <MenuOther model={{ id: record?.id }} actionRef={actionRef} />
          //     ),
          //   },
          //   action: 'drawer',
          //   btn: { text: '其它', size: 'small' },
          // },
          {
            domtype: 'button',
            modal: {
              msg: '请选择复制到',
              formColumns: toFormColumns,
            },
            fieldProps: {
              value: {
                saFormProps: { devEnable: false, grid: true },
              },
            },
            request: { url: 'dev/menu/copyTo' },
            action: 'confirmForm',
            btn: { text: '', size: 'small', icon: <CopyOutlined />, tooltip: '复制' },
          },
          {
            domtype: 'button',
            modal: {
              msg: '请选择移动到',
              formColumns: toFormColumns,
            },
            fieldProps: {
              value: {
                saFormProps: { devEnable: false, grid: true },
              },
            },
            request: { url: 'dev/menu/moveTo' },
            action: 'confirmForm',
            // btn: (
            //   <Tooltip title="复制模型">
            //     <Button size="small" icon={<CopyOutlined />} />
            //   </Tooltip>
            // ),
            btn: { text: '', size: 'small', icon: <RollbackOutlined />, tooltip: '移动至' },
          },
          {
            domtype: 'button',
            request: { url: 'dev/menu/import' },
            action: 'import',
            btn: { size: 'small', tooltip: '导入至', icon: <ImportOutlined />, text: '' },
            uploadProps: {
              accept: '.sql',
            },
            afterAction: reload,
          },
          {
            domtype: 'button',
            action: 'drawer',
            btn: { size: 'small', tooltip: '预览', icon: <EyeOutlined />, text: '' },
            if: '{{!record?.status && record?.page_type == "table"}}',
            modal: {
              title: '{{record.title + " - 预览"}}',
              drawerProps: {
                width: 1200,
              },
              childrenRender: (record) => (
                <TableFromBread type="drawer" menu_page_id={record?.id} alwaysenable={true} />
              ),
            },
          },
          {
            domtype: 'button',
            action: 'drawer',
            btn: { size: 'small', tooltip: '预览', icon: <EyeOutlined />, text: '' },
            if: '{{!record?.status && record?.page_type == "form"}}',
            modal: {
              title: '{{record.title + " - 预览"}}',
              drawerProps: {
                width: 1200,
              },
              childrenRender: (record) => (
                <FormFromBread
                  menu_page_id={record?.id}
                  fieldProps={{
                    props: {
                      submitter: 'dom',
                      msgcls: () => {
                        return true;
                      },
                    },
                  }}
                />
              ),
            },
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
      valueType: 'customerColumn',
      search: false,
      fieldProps: {
        items: [
          {
            domtype: 'text',
            action: 'dropdown',
            request: {
              url: '{{url}}',
              modelName: 'status',
              fieldNames: 'value,label',
              data: {
                actype: 'status',
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
    'option',
  ];

  return (
    <>
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
            afterAction: reload,
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
        tabs={MenuFormColumn}
        openType="modal"
        expandAll={false}
        level={setting?.adminSetting?.menu_max_level ? setting?.adminSetting?.menu_max_level : 4}
        tableProps={{
          scroll: { y: 600 },
          size: 'small',
        }}
        afterFormPost={reload}
        afterDelete={reload}
        url="dev/menu"
        grid={true}
        devEnable={false}
      />
    </>
  );
};
