import SaTable from '@/components/Sadmin/posts/table';
import { TreeNodeProps, TreeSelect } from 'antd';
import { useContext, useState } from 'react';
import { devDefaultFields } from './model';
import { SaDevContext } from '@/components/Sadmin/dev';
import { getModelColumns } from '@/components/Sadmin/dev/table/baseFormColumns';
import { CopyOutlined } from '@ant-design/icons';

//生成关联模型的字段及其管理模型
export const getModelColumnsTree = (id: number, allModels, pid: string = '', level = 1) => {
  const select_data = allModels?.find((v) => v.id == id);
  //console.log(foreign_model_id, allModels, select_data);
  const fields: Array<TreeNodeProps> = select_data
    ? [...select_data?.columns, ...devDefaultFields].map((v) => ({
        title: v.label ? v.label : [v.title, v.name].join(' - '),
        value: pid ? [pid, v.name ? v.name : v.value].join('-') : v.name ? v.name : v.value,
      }))
    : [];
  level += 1;

  if (level > 4) {
    //4层迭代后 直接终止 防止出现无限循环
    return fields;
  }
  //关联模型
  const guanlian: Array<TreeNodeProps> = select_data?.relations?.map((v) => ({
    title: [v.title, v.name].join(' - '),
    value: pid ? [pid, v.name, ''].join('-') : [v.name, ''].join('-'),
    children: getModelColumnsTree(
      v.foreign_model_id,
      allModels,
      pid ? [pid, v.id].join('-') : v.id,
      level,
    ),
  }));
  return [...fields, ...guanlian];
};

export default (props) => {
  const { model, contentRender } = props;
  const { setting } = useContext(SaDevContext);
  // const actionRef = useRef<ActionType>();
  // const { initialState, setInitialState } = useModel('@@initialState');
  //console.log('props', props);
  const relationType = ['one', 'many', 'cascaders', 'cascader'];
  // const reData = async () => {
  //   actionRef?.current?.reload();
  //   saReloadSetting(initialState, setInitialState, setSetting);
  //   return true;
  // };
  //const [toolbar, setToolbar] = useState();
  return (
    <SaTable
      name="relation"
      url="dev/relation"
      devEnable={false}
      //actionRef={actionRef}
      tableProps={{ params: { model_id: model?.id }, search: false }}
      // afterFormPost={reData}
      // afterDelete={reData}
      //toolBarRender={false}
      tableColumns={[
        { dataIndex: 'title', title: '名称' },
        { dataIndex: 'name', title: 'name' },
        { dataIndex: 'type', title: '类型' },
        {
          title: '额外操作',
          dataIndex: 'type',
          valueType: 'customerColumn',
          search: false,
          readonly: true,
          fieldProps: {
            items: [
              {
                domtype: 'button',
                fieldProps: {
                  value: {
                    saFormProps: { devEnable: false, grid: true },
                  },
                },
                modal: {
                  msg: '请选择复制到',
                  formColumns: [
                    {
                      valueType: 'group',
                      columns: [
                        {
                          dataIndex: 'toid',
                          title: '复制到模型',
                          valueType: 'treeSelect',
                          fieldProps: {
                            options: setting?.adminSetting?.dev?.allModelsTree,
                            treeLine: { showLeafIcon: true },
                            treeDefaultExpandAll: true,
                          },
                          colProps: { span: 12 },
                        },
                        {
                          dataIndex: 'type',
                          title: '方式',
                          valueType: 'radioButton',
                          fieldProps: {
                            options: [
                              { label: '插入', value: 'create' },
                              { label: '覆盖', value: 'update' },
                              { label: '复制', value: 'copy' },
                            ],
                            buttonStyle: 'solid',
                            defaultValue: 'create',
                          },
                          colProps: { span: 12 },
                        },
                      ],
                    },
                  ],
                },
                request: { url: 'dev/relation/copyToModel' },
                action: 'confirmForm',
                btn: { text: '', size: 'small', icon: <CopyOutlined />, tooltip: '复制关联' },
              },
            ],
          },
        },
        'option',
      ]}
      paramExtra={{ model_id: model?.id }}
      postExtra={{ model_id: model?.id }}
      // beforePost={(data) => {
      //   data.model_id = model?.id;
      // }}
      selectRowRender={(dom) => {
        return contentRender?.(null, dom);
      }}
      tabs={[
        {
          tab: { title: '基础信息' },
          formColumns: [
            {
              valueType: 'group',
              columns: [
                { dataIndex: 'title', title: '名称', colProps: { span: 12 } },
                { dataIndex: 'name', title: 'Name', colProps: { span: 12 } },
              ],
            },
            {
              valueType: 'group',
              columns: [
                {
                  dataIndex: 'local_key',
                  title: '本地字段',
                  valueType: 'select',
                  fieldProps: {
                    showSearch: true,
                    options: getModelColumns(model?.id, setting?.adminSetting?.dev, true),
                  },
                  colProps: { span: 12 },
                },
                {
                  title: '关系类型',
                  dataIndex: 'type',
                  valueType: 'select',
                  fieldProps: { options: relationType.map((v) => ({ label: v, value: v })) },
                  colProps: { span: 12 },
                },
              ],
            },
            {
              valueType: 'group',
              columns: [
                {
                  dataIndex: 'foreign_model_id',
                  title: '关联模型',
                  valueType: 'treeSelect',
                  fieldProps: {
                    options: setting?.adminSetting?.dev?.allModelsTree,
                    treeLine: { showLeafIcon: true },
                    treeDefaultExpandAll: true,
                  },
                  colProps: { span: 12 },
                },
                {
                  valueType: 'dependency',
                  name: ['foreign_model_id'],
                  columns: ({ foreign_model_id }: any) => {
                    if (!foreign_model_id) {
                      return [];
                    }
                    return [
                      {
                        dataIndex: 'foreign_key',
                        title: '关联模型字段',
                        valueType: 'select',
                        fieldProps: {
                          options: getModelColumns(
                            foreign_model_id,
                            setting?.adminSetting?.dev,
                            true,
                          ),
                          showSearch: true,
                        },
                        colProps: { span: 12 },
                      },
                    ];
                    //return [];
                  },
                },
              ],
            },
            {
              valueType: 'group',
              columns: [
                {
                  dataIndex: 'can_search',
                  colProps: { span: 12 },
                  title: '是否支持搜索',
                  valueType: 'switch',
                },
                {
                  valueType: 'dependency',
                  name: ['foreign_model_id', 'can_search'],
                  columns: ({ foreign_model_id, can_search }: any) => {
                    if (!foreign_model_id || !can_search) {
                      return [];
                    }
                    return [
                      {
                        dataIndex: 'search_columns',
                        title: '搜索包含字段',
                        valueType: 'select',
                        colProps: { span: 12 },
                        fieldProps: {
                          options: getModelColumns(
                            foreign_model_id,
                            setting?.adminSetting?.dev,
                            true,
                          ),
                          mode: 'multiple',
                        },
                      },
                    ];
                    //return [];
                  },
                },
              ],
            },
            {
              valueType: 'dependency',
              name: ['type', 'foreign_model_id'],
              columns: ({ type, foreign_model_id }: any) => {
                if (type == 'many') {
                  return [
                    {
                      valueType: 'group',
                      columns: [
                        {
                          dataIndex: 'with_count',
                          title: '是否计算数量总和',
                          valueType: 'switch',
                          colProps: { span: 12 },
                        },
                        {
                          dataIndex: 'with_sum',
                          title: '求和包含字段',
                          valueType: 'select',
                          colProps: { span: 12 },
                          fieldProps: {
                            options: getModelColumns(
                              foreign_model_id,
                              setting?.adminSetting?.dev,
                              true,
                            ),
                            mode: 'multiple',
                          },
                        },
                      ],
                    },
                  ];
                }
                return [];
              },
            },
            {
              valueType: 'group',
              columns: [
                {
                  title: '是否加入with',
                  dataIndex: 'is_with',
                  valueType: 'switch',
                  fieldProps: {
                    checkedChildren: '是',
                    unCheckedChildren: '否',
                  },
                  colProps: { span: 12 },
                },
                {
                  valueType: 'dependency',
                  name: ['foreign_model_id'],
                  columns: ({ foreign_model_id }: any) => {
                    if (!foreign_model_id) {
                      return [];
                    }
                    return [
                      {
                        dataIndex: 'select_columns',
                        title: '关联模型包含字段',
                        tooltip: '不选表示全部获取',
                        valueType: 'treeSelect',
                        colProps: { span: 12 },
                        fieldProps: {
                          options: getModelColumnsTree(
                            foreign_model_id,
                            setting?.adminSetting?.dev?.allModels,
                          ),
                          multiple: true,
                          treeLine: { showLeafIcon: false },
                          showCheckedStrategy: TreeSelect.SHOW_PARENT,
                          treeCheckable: true,
                        },
                      },
                    ];
                    //return [];
                  },
                },
              ],
            },
            {
              valueType: 'dependency',
              name: ['type', 'foreign_model_id'],
              columns: ({ type, foreign_model_id }: any) => {
                if (type == 'one' && foreign_model_id) {
                  return [
                    {
                      valueType: 'group',
                      columns: [
                        {
                          title: '是否加入with_in_page',
                          dataIndex: 'is_with_in_page',
                          valueType: 'switch',
                          fieldProps: {
                            checkedChildren: '是',
                            unCheckedChildren: '否',
                            defaultChecked: false,
                          },
                          colProps: { span: 12 },
                        },
                        {
                          dataIndex: 'in_page_select_columns',
                          title: '关联模型包含字段(选择数据所查询的字段)',
                          tooltip:
                            '默认使用字段配置中设置的label和value。未设置则使用id,title。勾选with_in_page后不选表示全部获取',
                          valueType: 'select',
                          colProps: { span: 12 },
                          fieldProps: {
                            options: getModelColumns(
                              foreign_model_id,
                              setting?.adminSetting?.dev,
                              true,
                            ),
                            mode: 'multiple',
                            multiple: true,
                          },
                        },
                      ],
                    },
                  ];
                }
                return [];
              },
            },
          ],
        },
        {
          tab: { title: '其它设置' },
          formColumns: [
            { dataIndex: 'with_default', title: 'withDefault', valueType: 'jsonEditor' },
            { dataIndex: 'filter', title: '筛选条件', valueType: 'jsonEditor' },
            { dataIndex: 'order_by', title: '排序', valueType: 'jsonEditor' },
          ],
        },
      ]}
      pageType="drawer"
      openType="drawer"
    />
  );
};
