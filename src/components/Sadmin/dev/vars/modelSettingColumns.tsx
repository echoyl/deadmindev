import { saFormTabColumnsType } from '../../helpers';
import { getModelColumns } from '../table/baseFormColumns';

export default (model_id: number, dev: { [key: string]: any }): saFormTabColumnsType => {
  //const columns: any[] = [];

  const modelColumns2: any[] = getModelColumns(model_id, dev);
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
              title: '自定义表头',
              dataIndex: 'ctitle',
              colProps: { span: 4 },
              tooltip: '自定义表头不适用数据库默认名称',
            },
            {
              title: '宽度',
              dataIndex: 'width',
              valueType: 'digit',
              colProps: { span: 4 },
              width: '100%',
            },
            {
              title: '自定义字段',
              dataIndex: 'cname',
              colProps: { span: 4 },
              tooltip: '无字段选择是可手动填入此项 . 分割为数组形式',
            },
            {
              title: '日期格式',
              dataIndex: 'dateformat',
              tooltip: '如果填写会按该格式格式化日期',
              colProps: { span: 4 },
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
          columns: [
            {
              title: '背景色',
              dataIndex: ['head', 'backgroud'],
              colProps: { span: 8 },
              valueType: 'colorPicker',
            },
            {
              title: '字体颜色',
              dataIndex: ['head', 'color'],
              colProps: { span: 8 },
              valueType: 'colorPicker',
            },
            {
              title: '字号大小',
              dataIndex: ['head', 'fontsize'],
              colProps: { span: 8 },
              valueType: 'digit',
              width: '100%',
            },
          ],
        },
      ],
    },
    {
      title: '头部显示',
      formColumns: [
        {
          title: '内容',
          dataIndex: ['top', 'content'],
          tooltip: '如果设置则会在最顶部显示该内容 支持blade模板用法 {{data}} 为传入的变量',
        },
        {
          valueType: 'group',
          columns: [
            {
              title: '背景色',
              dataIndex: ['top', 'background'],
              valueType: 'colorPicker',
              colProps: { span: 8 },
            },
            {
              title: '字体颜色',
              dataIndex: ['top', 'color'],
              colProps: { span: 8 },
              valueType: 'colorPicker',
            },
            {
              title: '字号大小',
              dataIndex: ['top', 'fontsize'],
              colProps: { span: 8 },
              valueType: 'digit',
              width: '100%',
            },
          ],
        },
      ],
    },
  ];
  //console.log('modelColumns2', modelColumns2);
  return [
    {
      title: '导出配置',
      formColumns: [
        {
          dataIndex: 'export',
          title: '模板管理',
          valueType: 'formList',
          columns: [
            {
              valueType: 'group',
              columns: [
                {
                  title: '模板名称',
                  dataIndex: 'label',
                },
                {
                  title: '模板索引',
                  dataIndex: 'value',
                },
                {
                  title: '设置',
                  dataIndex: 'config',
                  valueType: 'confirmForm',
                  fieldProps: {
                    btn: {
                      title: '设置',
                      size: 'middle',
                    },
                    width: 1200,
                    tabs: columns,
                    saFormProps: { devEnable: false },
                  },
                },
              ],
            },
          ],
        },
      ],
    },
    {
      title: '基础信息',
      formColumns: [
        {
          dataIndex: 'soft_delete',
          title: '软删除',
          valueType: 'switch',
        },
      ],
    },
  ];
};
