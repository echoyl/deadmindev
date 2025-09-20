import { saFormColumnsType, saTableColumnsType } from '@/components/Sadmin/helpers';
import Category from '@/components/Sadmin/posts/category';
import {
  CopyOutlined,
  FileOutlined,
  FolderOutlined,
  InsertRowLeftOutlined,
} from '@ant-design/icons';
import { ProFormInstance } from '@ant-design/pro-components';
import { Space } from 'antd';
import { useContext, useRef } from 'react';
import ModelRelation from './modelRelation';
import QuickCreate from './quickCreate';
import settingColumns from '@/components/Sadmin/dev/vars/model/settingColumns';
import { SaDevContext } from '@/components/Sadmin/dev';
import fieldColumns from '@/components/Sadmin/dev/vars/model/fieldColumns';
import tagOptions from '@/components/Sadmin/helper/tagOptions';
/**
 * 默认数据库有的字段
 */
export const devDefaultFields = tagOptions([
  { label: '创建时间 - created_at', value: 'created_at', color: 'processing' },
  { label: '最后更新时间 - updated_at', value: 'updated_at', color: 'processing' },
  { label: '软删除时间 - deleted_at', value: 'deleted_at', color: 'processing' },
  { label: '排序权重 - displayorder', value: 'displayorder', color: 'processing' },
  { label: '自定义字段 - customer_field', value: 'customer_field', color: 'processing' },
  { label: '系统用户ID - sys_admin_id', value: 'sys_admin_id', color: 'processing' },
  { label: '系统UUID - sys_admin_uuid', value: 'sys_admin_uuid', color: 'processing' },
]);

/**
 * 默认table列表中预设的字段列名
 */
export const devTabelFields = [];

export const modelFormColumns = (
  detail: Record<string, any>,
  formRef: ProFormInstance<any> | any,
  setting: Record<string, any>,
): saFormColumnsType => {
  const modelType = ['category', 'normal', 'auth'];
  const searchColumnType = ['=', 'like', 'whereBetween', 'whereIn', 'has', 'doesntHave'];

  return [
    {
      valueType: 'group',
      columns: [
        {
          title: '名称',
          dataIndex: 'title',
          colProps: { span: 12 },
          fieldProps: { placeholder: '请输入名称' },
          formItemProps: { required: true },
        },
        {
          title: 'name',
          dataIndex: 'name',
          colProps: { span: 12 },
          fieldProps: { placeholder: '请输入名称', required: true },
          formItemProps: { required: true },
        },
      ],
    },
    {
      valueType: 'group',
      columns: [
        {
          title: '模型所属',
          colProps: { span: 12 },
          dataIndex: 'admin_type',
          valueType: 'radioButton',
          fieldProps: {
            buttonStyle: 'solid',
            requestDataName: 'admin_types',
          },
        },
        {
          title: '类型',
          dataIndex: 'type',
          valueType: 'radioButton',
          colProps: { span: 12 },
          fieldProps: {
            placeholder: '请选择类型',
            buttonStyle: 'solid',
            options: [
              { label: '文件夹', value: 0 },
              { label: '模型', value: 1 },
            ],
          },
        },
      ],
    },
    {
      valueType: 'group',
      columns: [
        {
          title: '模型类型',
          dataIndex: 'leixing',
          valueType: 'radioButton',
          colProps: { span: 12 },
          fieldProps: {
            buttonStyle: 'solid',
            options: modelType.map((v) => ({ label: v, value: v })),
          },
        },
        {
          title: '字段配置',
          dataIndex: 'columns',
          valueType: 'confirmForm',
          colProps: { span: 3 },
          fieldProps: {
            btn: {
              title: '配置',
              size: 'middle',
            },
            formColumns: fieldColumns,
            //tabs: settingColumns(detail.id, setting?.dev),
            saFormProps: { devEnable: false, grid: true },
            initValue: (v) => {
              return { columns: v, add_customer_columns: detail?.add_customer_columns };
            },
            onChange: (v: Record<string, any[]>) => {
              formRef?.current?.setFieldValue('columns', v.columns);
            },
            width: 1500,
            showType: 'drawer',
          },
        },
        {
          title: '设置',
          dataIndex: 'setting',
          valueType: 'confirmForm',
          colProps: { span: 3 },
          fieldProps: {
            btn: {
              title: '设置',
              size: 'middle',
            },
            tabs: settingColumns(detail.id, setting?.dev),
            saFormProps: { devEnable: false, grid: true },
            //showType: 'drawer',
          },
        },
        {
          title: '提交后',
          dataIndex: 'afterPostOptions',
          valueType: 'checkbox',
          colProps: { span: 6 },
          tooltip: '勾选后自动创建或更新数据库表，在变更字段时使用',
          fieldProps: {
            options: [{ label: '生成表', value: 'createModelSchema' }],
            defaultValue: ['createModelSchema'],
          },
        },
      ],
    },
    {
      valueType: 'dependency',
      name: ['columns'],
      columns: ({ columns }: any) => {
        let foreignOptions = [];
        if (columns) {
          foreignOptions = columns
            ?.filter((v) => {
              return v.title && v.name;
            })
            .map((v) => ({
              label: [v.title, v.name].join(' - '),
              value: v.name,
            }));
        } else {
          return [];
        }

        return [
          {
            title: '搜索配置',
            dataIndex: 'search_columns',
            valueType: 'formList',
            rowProps: {
              gutter: 0,
            },
            columns: [
              {
                valueType: 'group',
                columns: [
                  {
                    title: 'url参数名称',
                    dataIndex: 'name',
                    colProps: { span: 8 },
                  },
                  {
                    title: '类型',
                    dataIndex: 'type',
                    valueType: 'select',
                    fieldProps: {
                      options: searchColumnType.map((v) => ({ label: v, value: v })),
                    },
                    colProps: { span: 4 },
                  },
                  {
                    title: '字段',
                    dataIndex: 'columns',
                    valueType: 'select',
                    tooltip: '不存在的字段请自行输入，比如whereHas，请输入关联名称',
                    colProps: { span: 12 },
                    fieldProps: {
                      options: [...foreignOptions, ...devDefaultFields],
                      mode: 'tags',
                    },
                  },
                ],
              },
            ],
          },
          {
            title: '唯一字段检测',
            dataIndex: 'unique_fields',
            valueType: 'formList',
            rowProps: {
              gutter: 0,
            },
            columns: [
              {
                valueType: 'group',
                columns: [
                  {
                    title: '字段',
                    dataIndex: 'columns',
                    valueType: 'select',
                    //width: 300,
                    fieldProps: {
                      options: [...foreignOptions, ...devDefaultFields],
                      mode: 'multiple',
                    },
                    colProps: { span: 12 },
                  },
                  {
                    title: '提示语',
                    dataIndex: 'message',
                    colProps: { span: 12 },
                  },
                ],
              },
            ],
          },
        ];
      },
    },

    'parent_id',
  ];
};

export default () => {
  const { setting } = useContext(SaDevContext);
  // const actionRef = useRef<ActionType>();
  // const { initialState, setInitialState } = useModel('@@initialState');
  // const { setSetting } = useContext(SaDevContext);

  const tableColumns: saTableColumnsType = [
    {
      title: '标题',
      dataIndex: 'title',
      render: (dom, record) => (
        <Space>
          {record.type == 1 ? <FileOutlined /> : <FolderOutlined />}
          {record.title}
        </Space>
      ),
      search: false,
    },
    {
      title: '名称',
      dataIndex: 'name',
      search: false,
    },
    {
      title: '额外操作',
      dataIndex: 'type',
      valueType: 'customerColumn',
      search: false,
      readonly: true,
      fieldProps: {
        items: [
          {
            if: '{{record.type == 1}}',
            domtype: 'button',
            modal: {
              title: '{{record.title + " - 关联管理"}}',
              drawerProps: {
                width: 1000,
                styles: { body: { padding: 16 } },
              },
              childrenRender: (record) => <ModelRelation model={record} />,
            },
            action: 'drawer',
            btn: { text: '', icon: <InsertRowLeftOutlined />, tooltip: '模型关联', size: 'small' },
          },
          {
            domtype: 'button',
            if: '{{record.type == 1}}',
            modal: {
              msg: '请选择复制到',
              formColumns: [
                {
                  dataIndex: 'toid',
                  width: 'md',
                  title: '复制到文件夹',
                  valueType: 'treeSelect',
                  fieldProps: {
                    options: setting?.adminSetting?.dev?.folderModelsTree,
                    treeLine: { showLeafIcon: true },
                    treeDefaultExpandAll: true,
                  },
                },
              ],
            },
            request: { url: 'dev/model/copyToFolder' },
            action: 'confirmForm',
            // btn: (
            //   <Tooltip title="复制模型">
            //     <Button size="small" icon={<CopyOutlined />} />
            //   </Tooltip>
            // ),
            btn: { text: '', size: 'small', icon: <CopyOutlined />, tooltip: '复制模型' },
          },
        ],
      },
    },
    'option',
  ];

  const formRef = useRef<ProFormInstance<any>>({} as any);

  // const reData = async () => {
  //   actionRef?.current?.reload();
  //   saReloadSetting(initialState, setInitialState, setSetting);
  //   return true;
  // };

  return (
    <>
      <Category
        formRef={formRef}
        //actionRef={actionRef}
        tableTitle={false}
        table_menu_key="admin_type"
        table_menu_all={false}
        tableColumns={tableColumns}
        // afterFormPost={reData}
        // afterDelete={reData}
        devEnable={false}
        tableProps={{
          scroll: { y: 600 },
        }}
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
        ]}
        toolBar={() => {
          return (
            <>
              <QuickCreate
                menus={setting?.adminSetting?.dev?.allMenus}
                models={setting?.adminSetting?.dev?.allModelsTree}
                foldermodels={setting?.adminSetting?.dev?.folderModelsTree}
              />
            </>
          );
        }}
        expandAll={false}
        level={4}
        url="dev/model"
        formColumns={(detail) => {
          return modelFormColumns(detail, formRef, setting?.adminSetting);
        }}
        openType="modal"
      />
    </>
  );
};
