import { devDefaultFields, devTabelFields } from '@/pages/dev/model';
import { TreeNodeProps } from 'antd';
import { saFormColumnsType, saTableColumnsType } from '../../helpers';
import { uniqBy } from 'es-toolkit';
//列表可选类型
export const columnType = [
  { label: '日期 - date', value: 'date' },
  { label: '日期区间 - dateRange', value: 'dateRange' },
  { label: '时间 - dateTime', value: 'dateTime' },
  { label: '时间区间 - dateTimeRange', value: 'dateTimeRange' },
  { label: '上传-uploader', value: 'uploader' },
  { label: '自定义组件 - customerColumn', value: 'customerColumn' },
  { label: '密码 - password', value: 'password' },
  { label: '头像 - avatar', value: 'avatar' },
  { label: '导出 - export', value: 'export' },
  { label: '导入 - import', value: 'import' },
  { label: '头部操作栏 - toolbar', value: 'toolbar' },
  { label: '底部选择操作栏 - selectbar', value: 'selectbar' },
  { label: '省市区 - pca', value: 'pca' },
  { label: '用户权限 - userPerm', value: 'userPerm' },
  { label: 'html', value: 'html' },
  { label: 'Select选择器', value: 'select' },
  { label: '拾色器 - colorPicker', value: 'colorPicker' },
  { label: '下拉操作 - dropdownAction', value: 'dropdownAction' },
  { label: '异步下拉选择器 - debounceSelect', value: 'debounceSelect' },
  { label: '搜索select', value: 'searchSelect' },
  { label: '评分 - rate', value: 'rate' },
  { label: '滑动条 - slider', value: 'saSlider' },
  { label: '操作栏 - option', value: 'option' },
  { label: '排序 - dragsort', value: 'dragsort' },
];
//表单可选类型
const formMoreType = [
  { label: '编辑表格 - saFormTable', value: 'saFormTable' },
  { label: '自定义显示 - customerColumn', value: 'customerColumn' },
  { label: '属性配置 - jsonForm', value: 'jsonForm' },
  { label: '多行编辑 - formList', value: 'formList' },
  { label: '多行编辑 - saFormList', value: 'saFormList' },
  { label: 'Select选择器', value: 'select' },
  { label: '异步下拉选择器 - debounceSelect', value: 'debounceSelect' },
  { label: '搜索select', value: 'searchSelect' },
  { label: 'json编辑器 - jsonEditor', value: 'jsonEditor' },
  { label: 'jsonCode', value: 'jsonCode' },
  { label: '头像显示 - avatar', value: 'avatar' },
  { label: '弹层选择器 - modalSelect', value: 'modalSelect' },
  { label: '富文本 - tinyEditor', value: 'tinyEditor' },
  { label: '规格编辑 - guigePanel', value: 'guigePanel' },
  { label: '权限配置 - permGroup', value: 'permGroup' },
  { label: '自定义 - cdependency', value: 'cdependency' },
  { label: '微信自定义菜单 - wxMenu', value: 'wxMenu' },
  { label: '穿梭框 - saTransfer', value: 'saTransfer' },
  { label: 'html显示', value: 'html' },
  { label: '地图选点', value: 'mapInput' },
  { label: '地图显示', value: 'mapShow' },
  { label: '拾色器 - colorPicker', value: 'colorPicker' },
  { label: '密码 - password', value: 'password' },
  { label: '文本域 - textarea', value: 'textarea' },
  { label: '上传 - uploader', value: 'uploader' },
  { label: 'markdown编辑器 - mdEditor', value: 'mdEditor' },
  { label: '分割线 - divider', value: 'divider' },
  { label: '数字 - digit', value: 'digit' },
  { label: 'icon选择器 - iconSelect', value: 'iconSelect' },
  { label: 'treeSelect', value: 'treeSelect' },
  { label: 'cascader', value: 'cascader' },
  { label: 'radio', value: 'radio' },
  { label: 'switch', value: 'switch' },
  { label: 'AutoComplete', value: 'saAutoComplete' },
  { label: '单选按钮 - radioButton', value: 'radioButton' },
  { label: '省市区 - pca', value: 'pca' },
  { label: '日期 - date', value: 'date' },
  { label: '日期年 - dateYear', value: 'dateYear' },
  { label: '日期季度 - dateQuarter', value: 'dateQuarter' },
  { label: '日期月 - dateMonth', value: 'dateMonth' },
  { label: '日期周 - dateWeek', value: 'dateWeek' },
  { label: '日期时间 - datetime', value: 'datetime' },
  { label: '时间 - time', value: 'time' },
  { label: '评分 - rate', value: 'rate' },
  { label: '滑动条 - slider', value: 'saSlider' },
  { label: '日历表单 - formCalendar', value: 'formCalendar' },
  { label: 'alert提醒 - alert', value: 'alert' },
];

export const getModelColumnsSelect = (id: number, allModels: any[], level = 1) => {
  const select_data = allModels?.find((v) => v.id == id);
  //console.log(allModels, select_data);
  const fields: Array<TreeNodeProps> = select_data?.columns
    ?.map((v) => ({
      label: v.label ? v.label : [v.title, v.name].join(' - '),
      value: v.name,
    }))
    .filter((v) => {
      return !devDefaultFields.find((_v) => _v.value == v.value);
    });
  level += 1;

  if (level > 4) {
    //4层迭代后 直接终止 防止出现无限循环
    return fields;
  }
  //关联模型
  const guanlian: Array<TreeNodeProps> = select_data?.relations?.map((v) => ({
    label: [v.title, v.name].join(' - '),
    value: v.name,
    children: getModelColumnsSelect(v.foreign_model_id, allModels, level),
  }));
  return fields ? [...fields, ...guanlian] : [];
};

export const getModelRelationSelect = (id: number, allModels, level = 1) => {
  const select_data = allModels?.find((v) => v.id == id);
  level += 1;
  if (level > 3) {
    //3层迭代后 直接终止 防止出现无限循环
    return [];
  }
  //关联模型
  const guanlian: Array<TreeNodeProps> = select_data?.relations?.map((v) => ({
    label: [v.title, v.name].join(' - '),
    value: v.name,
    children: getModelRelationSelect(v.foreign_model_id, allModels, level),
  }));
  //console.log('guanlian', guanlian);
  return guanlian;
};

export const getModelById = (model_id: number, models: any[]) => {
  return models?.find((v) => v.id == model_id);
};

export const getModelRelations = (model_id: number, dev: { [key: string]: any }): any[] => {
  //console.log('model_id', model_id, dev);
  const { allModels } = dev;
  const model = getModelById(model_id, allModels);
  const manyRelation: any[] = [];
  const oneRelation: any[] = [];
  model?.relations
    ?.filter((v) => v.type == 'one' || v.type == 'many')
    .map((v) => {
      //读取关联模型的字段信息
      //const foreign_model_columns = getJson(v.foreign_model.columns,[]);
      // const children = foreign_model_columns.map((v) => ({
      //   label: [v.title, v.name].join(' - '),
      //   value: v.name,
      //   children:getModelColumnsSelect(v.foreign_model_id,data.allModels)
      // }));
      const children = getModelRelationSelect(v.foreign_model_id, allModels, 2);
      //console.log('my children ', children);
      if (v.type == 'many') {
        manyRelation.push({
          label: [v.title, v.name, 'many'].join(' - '),
          value: v.name,
          children,
        });
      }
      if (v.type == 'one') {
        oneRelation.push({
          label: [v.title, v.name, 'one'].join(' - '),
          value: v.name,
          children,
        });
      }
      return {
        label: [v.title, v.name, v.type == 'one' ? 'hasOne' : 'hasMany'].join(' - '),
        value: v.name,
        children: children,
      };
    });
  return [...manyRelation, ...oneRelation];
};

export const getModelColumns = (
  model_id: number,
  dev: { [key: string]: any } = { allModels: [] },
  justTop: boolean = false,
) => {
  const { allModels = [] } = dev;
  //console.log('model_id', model_id, allModels);
  const model = getModelById(model_id, allModels);
  const allColumns = getModelColumnsSelect(model_id, allModels, justTop ? 100 : 1);

  //检测模型关系 提供给table列选择字段
  const foreignOptions = model?.columns?.map((v) => ({
    label: [v.title, v.name].join(' - '),
    value: v.name,
  }));
  if (!justTop) {
    model?.relations?.forEach((v) => {
      if (v.type == 'many') {
        if (v.with_count) {
          foreignOptions.push({
            label: [v.title, 'count'].join(' - '),
            value: [v.name, 'count'].join('_'),
          });
        }
        if (v.with_sum) {
          v.with_sum.split(',').forEach((vs) => {
            foreignOptions.push({
              label: [v.title, 'sum', vs].join(' - '),
              value: [v.name, 'sum', vs].join('_'),
            });
          });
        }
      }
    });
  }
  //检测模型搜索设置 提供给table列选择字段 20230904 可能存在重复键值导致组件错误，暂时不要这个功能
  const existColumns = foreignOptions && !justTop ? [...foreignOptions, ...devDefaultFields] : [];
  const search_columns = model?.search_columns ? model.search_columns : [];
  const searchColumn = search_columns
    .filter((v) => {
      return (
        existColumns.findIndex((val) => val.value == v.name) < 0 &&
        allColumns?.findIndex((val) => val.value == v.name) < 0
      );
    })
    .map((v) => ({
      label: [v.name, '搜索字段'].join(' - '),
      value: v.name,
    }));
  return uniqBy(
    [...(allColumns ? allColumns : []), ...devDefaultFields, ...devTabelFields, ...searchColumn],
    (item) => item.value,
  );
};

type devTabelFieldsProps = {
  model_id?: number;
  dev?: { allMenus: any[]; allModels: any[] };
};

export const devBaseFormColumns = (props: devTabelFieldsProps) => {
  const { model_id = 0, dev = { allMenus: [] } } = props;
  const { allMenus = [] } = dev;
  const modelColumns2: any[] = getModelColumns(model_id, dev);
  const relations = getModelRelations(model_id, dev);
  const columns: saFormColumnsType = [
    {
      dataIndex: 'columns',
      valueType: 'formList',
      columns: [
        {
          valueType: 'group',
          columns: [
            {
              title: '字段选择',
              valueType: 'cascader',
              dataIndex: 'key',
              width: 240,
              fieldProps: {
                options: modelColumns2,
                showSearch: true,
                changeOnSelect: true,
              },
            },
            {
              valueType: 'dependency',
              name: ['props'],
              columns: ({ props }: any) => {
                //console.log(props);
                //return [];
                return [
                  {
                    dataIndex: '',
                    title: '自定义Title',
                    readonly: true,
                    render: () => {
                      return <div style={{ width: 100 }}>{props?.title ? props.title : ' - '}</div>;
                    },
                  },
                ];
              },
            },
            {
              dataIndex: 'props',
              title: '更多',
              valueType: 'customerColumnDev',
              fieldProps: {
                relationModel: relations,
                allMenus,
                modelColumns: modelColumns2,
              },
              width: 160,
            },
            {
              dataIndex: 'type',
              title: '表单类型',
              valueType: 'select',
              width: 'sm',
              fieldProps: {
                options: formMoreType,
                placeholder: '请选择表单额外类型',
              },
            },
            // {
            //   title: '自定义title',
            //   dataIndex: 'title',
            //   width: 120,
            // },
            // {
            //   title: '关联属性字段',
            //   dataIndex: 'label',
            //   width: 120,
            // },
            {
              dataIndex: 'readonly',
              title: '是否只读',
              valueType: 'switch',
              fieldProps: {
                checkedChildren: 'readonly',
                unCheckedChildren: 'readonly',
                defaultChecked: false,
              },
            },
            {
              dataIndex: 'required',
              title: '是否必填',
              valueType: 'switch',
              fieldProps: {
                checkedChildren: 'required',
                unCheckedChildren: 'required',
                defaultChecked: false,
              },
            },
            {
              dataIndex: 'hidden',
              title: '是否隐藏',
              valueType: 'switch',
              fieldProps: {
                checkedChildren: 'hidden',
                unCheckedChildren: 'hidden',
                defaultChecked: false,
              },
            },
            {
              dataIndex: 'disabled',
              title: '是否禁用',
              valueType: 'switch',
              fieldProps: {
                checkedChildren: 'disabled',
                unCheckedChildren: 'disabled',
                defaultChecked: false,
              },
            },
            // {
            //   title: 'placeholder',
            //   dataIndex: 'placeholder',
            // },

            // {
            //   dataIndex: 'name',
            //   title: '额外信息',
            //   valueType: 'modalJson',
            //   fieldProps: {
            //     placeholder:
            //       '如果是with数据 请输入要显示关联数据的字段名称 多级用.拼接',
            //   },
            // },
          ],
        },
      ],
    },
    // {
    //   dataIndex: 'key',
    //   valueType: 'select',
    //   width: 'xl',
    //   fieldProps: {
    //     options: modelColumns,
    //     mode: 'multiple',
    //   },
    // },
  ];
  return columns;
};

export const devBaseFormFormColumns = (props: devTabelFieldsProps) => {
  const { model_id = 0, dev = { allMenus: [] } } = props;
  const modelColumns2: any[] = getModelColumns(model_id, dev);
  const columns: saFormColumnsType = [
    {
      valueType: 'group',
      columns: [
        {
          title: '字段选择',
          valueType: 'cascader',
          dataIndex: 'key',
          colProps: { span: 12 },
          fieldProps: {
            options: modelColumns2,
            showSearch: true,
            changeOnSelect: true,
          },
        },
        {
          dataIndex: 'type',
          title: '表单类型',
          colProps: { span: 12 },
          valueType: 'select',
          fieldProps: {
            options: formMoreType,
            showSearch: true,
            placeholder: '请选择表单额外类型',
          },
        },
      ],
    },
    {
      valueType: 'group',
      columns: [
        {
          dataIndex: ['props', 'title'],
          title: '自定义Title',
          colProps: { span: 12 },
        },
        {
          title: '自定义字段',
          tooltip: '如果选择器中无想要的字段名称，请填写在这里',
          dataIndex: ['props', 'dataIndex'],
          colProps: {
            span: 12,
          },
        },
      ],
    },
    {
      valueType: 'group',
      columns: [
        {
          dataIndex: 'readonly',
          title: '是否只读',
          valueType: 'switch',
          formItemProps: {
            hidden: true,
          },
          fieldProps: {
            checkedChildren: 'readonly',
            unCheckedChildren: 'readonly',
            defaultChecked: false,
          },
          // colProps: { span: 6 },
        },
        {
          dataIndex: 'required',
          title: '是否必填',
          valueType: 'switch',
          formItemProps: {
            hidden: true,
          },
          fieldProps: {
            checkedChildren: 'required',
            unCheckedChildren: 'required',
            defaultChecked: false,
          },
          // colProps: { span: 6 },
        },
        {
          dataIndex: 'hidden',
          title: '是否隐藏',
          valueType: 'switch',
          fieldProps: {
            checkedChildren: 'hidden',
            unCheckedChildren: 'hidden',
            defaultChecked: false,
          },
          colProps: { span: 12 },
        },
        {
          dataIndex: 'disabled',
          title: '是否禁用',
          valueType: 'switch',
          fieldProps: {
            checkedChildren: 'disabled',
            unCheckedChildren: 'disabled',
            defaultChecked: false,
          },
          colProps: { span: 12 },
        },
      ],
    },
  ];
  return columns;
};

export const devBaseTableColumns = (props: devTabelFieldsProps) => {
  const { model_id = 0, dev = { allMenus: [] } } = props;
  const { allMenus = [] } = dev;
  const modelColumns2: any[] = getModelColumns(model_id, dev);
  const relations = getModelRelations(model_id, dev);

  const columns: saTableColumnsType = [
    {
      dataIndex: 'key',
      title: '字段',
      width: 'sm',
      valueType: 'cascader',
      fieldProps: {
        options: modelColumns2,
        showSearch: true,
        changeOnSelect: true,
      },
    },

    {
      valueType: 'dependency',
      name: ['props'],
      columns: ({ props }: any) => {
        //console.log(props);
        //return [];
        return [
          {
            dataIndex: '',
            title: '自定义表头',
            readonly: true,
            render: () => {
              return <div style={{ width: 100 }}>{props?.title ? props.title : ' - '}</div>;
            },
          },
        ];
      },
    },
    {
      dataIndex: 'can_search',
      valueType: 'checkbox',
      title: '搜索',
      fieldProps: {
        options: [{ label: '可搜索', value: 1 }],
      },
    },
    {
      dataIndex: 'hide_in_table',
      valueType: 'checkbox',
      title: '表中隐藏',
      width: 75,
      fieldProps: {
        options: [{ label: '隐藏', value: 1 }],
      },
    },
    {
      dataIndex: 'table_menu',
      valueType: 'checkbox',
      title: '开启tab',
      width: 75,
      fieldProps: {
        options: [{ label: 'tab', value: 1 }],
      },
    },
    {
      dataIndex: 'sort',
      valueType: 'checkbox',
      title: '开启排序',
      width: 75,
      fieldProps: {
        options: [{ label: '排序', value: 1 }],
      },
    },
    {
      dataIndex: 'props',
      title: '更多',
      valueType: 'customerColumnDev',
      fieldProps: {
        relationModel: relations,
        allMenus,
        modelColumns: modelColumns2,
      },
      width: 75,
    },
    {
      dataIndex: 'type',
      width: 220,
      valueType: 'select',
      title: '字段类型',
      fieldProps: {
        options: columnType,
        placeholder: '请选择表字段类型',
      },
    },
    {
      dataIndex: 'left_menu',
      valueType: 'checkbox',
      title: '左侧菜单',
      fieldProps: {
        options: [{ label: '左侧菜单', value: 1 }],
      },
      width: 100,
    },
    {
      valueType: 'dependency',
      name: ['left_menu'],
      columns: ({ left_menu }: any) => {
        if (left_menu && left_menu.length > 0) {
          return [
            {
              dataIndex: 'left_menu_field',
              fieldProps: {
                placeholder: '请输入左侧菜单label，value字段名称',
              },
            },
          ];
        }
        return [];
      },
    },
  ];
  return columns;
};

export const devBaseTableFormColumns = (props: devTabelFieldsProps): saFormColumnsType => {
  const { model_id = 0, dev = { allMenus: [] } } = props;
  const modelColumns2: any[] = getModelColumns(model_id, dev);

  const columns: saFormColumnsType = [
    {
      valueType: 'group',
      columns: [
        {
          dataIndex: 'key',
          title: '字段',
          colProps: { span: 12 },
          valueType: 'cascader',
          fieldProps: {
            options: modelColumns2,
            showSearch: true,
            changeOnSelect: true,
          },
        },
        {
          dataIndex: 'type',
          colProps: { span: 12 },
          valueType: 'select',
          title: '字段类型',
          fieldProps: {
            options: columnType,
            showSearch: true,
            placeholder: '请选择表字段类型',
          },
        },
      ],
    },
    {
      valueType: 'group',
      columns: [
        {
          dataIndex: ['props', 'title'],
          title: '自定义Title',
          colProps: { span: 12 },
        },
        {
          title: '自定义字段',
          tooltip: '如果选择器中无想要的字段名称，请填写在这里',
          dataIndex: ['props', 'dataIndex'],
          colProps: {
            span: 12,
          },
        },
      ],
    },
    {
      valueType: 'group',
      columns: [
        {
          dataIndex: 'can_search',
          valueType: 'checkbox',
          title: '搜索',
          fieldProps: {
            options: [{ label: '可搜索', value: 1 }],
          },
          colProps: { span: 6 },
        },
        {
          dataIndex: 'hide_in_table',
          valueType: 'checkbox',
          title: '表中隐藏',
          fieldProps: {
            options: [{ label: '隐藏', value: 1 }],
          },
          colProps: { span: 6 },
        },
        {
          dataIndex: 'table_menu',
          valueType: 'checkbox',
          title: '开启tab',
          fieldProps: {
            options: [{ label: 'tab', value: 1 }],
          },
          tooltip: '1.必须在模型中开启tab 2.数据必须是[{label,value}] 不能设置其它字段名称',
          colProps: { span: 6 },
        },
        {
          dataIndex: 'sort',
          valueType: 'checkbox',
          title: '开启排序',
          fieldProps: {
            options: [{ label: '排序', value: 1 }],
          },
          colProps: { span: 6 },
        },
      ],
    },
    {
      valueType: 'group',
      columns: [
        {
          dataIndex: 'left_menu',
          valueType: 'checkbox',
          title: '左侧菜单',
          fieldProps: {
            options: [{ label: '左侧菜单', value: 1 }],
          },
          colProps: { span: 6 },
        },
        {
          valueType: 'dependency',
          name: ['left_menu'],
          columns: ({ left_menu }: any) => {
            if (left_menu && left_menu.length > 0) {
              return [
                {
                  dataIndex: 'left_menu_field',
                  title: '左侧菜单配置',
                  fieldProps: {
                    placeholder: '请输入左侧菜单label，value字段名称',
                  },
                  colProps: { span: 6 },
                },
              ];
            }
            return [];
          },
        },
        {
          dataIndex: 'rowSpan',
          valueType: 'switch',
          title: '行合并',
          colProps: { span: 6 },
        },
        {
          dataIndex: 'editable',
          valueType: 'switch',
          title: '表中编辑',
          colProps: { span: 6 },
        },
        {
          dataIndex: 'editable_type',
          valueType: 'select',
          title: '编辑类型',
          colProps: { span: 6 },
          fieldProps: {
            options: [
              { lable: 'number', value: 'number' },
              { lable: 'string', value: 'string' },
            ],
          },
        },
      ],
    },
  ];
  return columns;
};
