import { saFormColumnsType, saFormTabColumnsType } from '../../../helpers';
import { getModelColumns } from '../../table/baseFormColumns';

export default (model_id: number, dev: { [key: string]: any }): saFormTabColumnsType => {
  //const columns: any[] = [];
  const styleColumns = (name?: string): saFormColumnsType => {
    const getname = (rname: string, tname?: string) => {
      return tname ? [tname, rname] : rname;
    };
    return [
      {
        valueType: 'group',
        columns: [
          {
            title: '背景色',
            dataIndex: getname('background', name),
            valueType: 'colorPicker',
            colProps: { span: 12 },
          },
          {
            title: '字体颜色',
            dataIndex: getname('color', name),
            colProps: { span: 12 },
            valueType: 'colorPicker',
          },
        ],
      },
      {
        valueType: 'group',
        columns: [
          {
            title: '字号大小',
            dataIndex: getname('fontsize', name),
            colProps: { span: 12 },
            valueType: 'digit',
            width: '100%',
          },
          {
            title: '行高',
            dataIndex: getname('height', name),
            colProps: { span: 12 },
            valueType: 'digit',
            width: '100%',
          },
        ],
      },
      {
        valueType: 'group',
        columns: [
          {
            title: '是否边框',
            dataIndex: getname('border', name),
            valueType: 'switch',
            colProps: { span: 12 },
          },
          {
            title: '是否加粗',
            dataIndex: getname('bold', name),
            valueType: 'switch',
            colProps: { span: 12 },
          },
        ],
      },
    ];
  };
  const modelColumns2: any[] = getModelColumns(model_id, dev);
  const columnsSetting: saFormTabColumnsType = [
    {
      title: '设置',
      formColumns: [
        {
          valueType: 'group',
          columns: [
            {
              title: '日期格式',
              dataIndex: 'dateformat',
              tooltip: '如果填写会按该格式格式化日期',
              colProps: { span: 12 },
            },
            {
              title: '是否合计',
              dataIndex: 'sum',
              valueType: 'switch',
              colProps: { span: 6 },
            },
            {
              title: '是否合行合并',
              dataIndex: 'row_merge',
              valueType: 'switch',
              colProps: { span: 6 },
            },
          ],
        },
        ...styleColumns(),
      ],
    },
  ];

  const columns: saFormTabColumnsType = [
    {
      title: '表头设置',
      formColumns: [
        {
          valueType: 'saFormList',
          title: '表头设置',
          dataIndex: ['head', 'columns'],
          fieldProps: {
            grid: true,
            showtype: 'table',
          },
          columns: [
            {
              title: '表头显示',
              dataIndex: 'ctitle',
              colProps: { span: 3 },
            },
            {
              title: '宽度设置',
              dataIndex: 'width',
              valueType: 'digit',
              colProps: { span: 3 },
              fieldProps: {
                defaultValue: '15',
              },
              width: '100%',
            },
            {
              title: '自定义字段',
              dataIndex: 'cname',
              colProps: { span: 3 },
              tooltip: '无字段选择是可手动填入此项 . 分割为数组形式',
            },
            {
              title: '类型选择',
              dataIndex: 'type',
              valueType: 'select',
              fieldProps: {
                options: [
                  { label: '价格', value: 'price' },
                  { label: '日期', value: 'date' },
                  { label: '序号', value: 'index' },
                ],
              },
              tooltip: '支持价格类，日期，序号类型',
              colProps: { span: 3 },
            },
            {
              title: '设置',
              dataIndex: 'setting',
              valueType: 'confirmForm',
              colProps: { span: 2 },
              fieldProps: {
                btn: {
                  title: '设置',
                  size: 'middle',
                },
                tabs: columnsSetting,
                saFormProps: { devEnable: false },
              },
            },
            {
              title: '字段选择',
              valueType: 'cascader',
              dataIndex: 'key',
              fieldProps: {
                options: modelColumns2,
                showSearch: true,
                changeOnSelect: true,
              },
              colProps: { span: 8 },
              width: 230,
            },
          ],
        },
        {
          valueType: 'group',
          dataIndex: 'head_setting',
          title: '表头设置',
          columns: [...styleColumns('head')],
        },
      ],
    },
    {
      title: '顶部显示',
      formColumns: [
        {
          title: '内容',
          dataIndex: ['top', 'content'],
          tooltip: '如果设置则会在最顶部显示该内容 支持blade模板用法 {{data}} 为传入的变量',
        },
        ...styleColumns('top'),
      ],
    },
    {
      title: '默认样式',
      formColumns: [...styleColumns('data')],
    },
  ];
  //console.log('modelColumns2', modelColumns2);
  return [
    {
      title: '基础信息',
      formColumns: [
        {
          valueType: 'group',
          columns: [
            {
              dataIndex: 'soft_delete',
              title: '软删除',
              valueType: 'switch',
              colProps: { span: 12 },
            },
            {
              dataIndex: 'with_system_admin_id',
              title: '自动插入系统用户ID',
              valueType: 'switch',
              colProps: { span: 12 },
            },
          ],
        },
        {
          valueType: 'group',
          columns: [
            {
              dataIndex: 'global_data_search',
              title: '使用全局过滤数据',
              valueType: 'switch',
              colProps: { span: 12 },
            },
            {
              dataIndex: 'global_post_check',
              title: '使用全局检测提交数据',
              valueType: 'switch',
              colProps: { span: 12 },
            },
          ],
        },
        {
          valueType: 'group',
          columns: [
            {
              dataIndex: 'has_uuids',
              title: '开启HasUuids',
              tooltip: '是否开启自动插入uuid',
              valueType: 'switch',
              colProps: { span: 12 },
            },
            {
              dataIndex: 'has_uuids_name',
              title: 'UUID字段名',
              tooltip: '默认为sys_admin_uuid',
              colProps: { span: 12 },
            },
          ],
        },
        {
          valueType: 'group',
          columns: [
            {
              dataIndex: 'justModelFile',
              title: '仅生成模型文件',
              tooltip: '勾选后保存模型或关联都只生成模型文件不生成控制器文件',
              valueType: 'switch',
              colProps: { span: 12 },
            },
            {
              dataIndex: 'justControllerFile',
              title: '仅生成控制器文件',
              tooltip: '勾选后只生成控制器文件，即只是一个虚拟模型没有字段信息',
              valueType: 'switch',
              colProps: { span: 12 },
            },
          ],
        },
      ],
    },
    {
      title: '导出配置',
      formColumns: [
        {
          dataIndex: 'export',
          title: '模板管理',
          valueType: 'formList',
          rowProps: {
            gutter: 0,
          },
          columns: [
            {
              valueType: 'group',
              columns: [
                {
                  title: '模板名称',
                  dataIndex: 'label',
                  colProps: { span: 8 },
                },
                {
                  title: '模板索引',
                  dataIndex: 'value',
                  colProps: { span: 8 },
                },
                {
                  title: '设置',
                  dataIndex: 'config',
                  valueType: 'confirmForm',
                  colProps: { span: 8 },
                  fieldProps: {
                    btn: {
                      title: '设置',
                      size: 'middle',
                    },
                    width: 1050,
                    tabs: columns,
                    saFormProps: { devEnable: false, grid: true },
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ];
};
