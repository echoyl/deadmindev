import type { Key } from 'react';
import { t, type saFormTabColumnsType } from '../../helpers';

const requestForm = (modelId: Key): saFormTabColumnsType => [
  {
    title: t('baseInfo'),
    formColumns: [
      {
        valueType: 'group',
        columns: [
          {
            dataIndex: 'url',
            title: 'URL',
            colProps: { span: 12 },
          },
          {
            dataIndex: 'method',
            valueType: 'select',
            title: t('method'),
            fieldProps: {
              options: [
                { label: 'GET', value: 'get' },
                { label: 'POST', value: 'post' },
              ],
              defaultValue: 'post',
            },
            colProps: { span: 6 },
          },
          {
            dataIndex: 'then',
            valueType: 'select',
            title: 'Callback',
            fieldProps: {
              options: [
                { label: 'system', value: 'system' },
                { label: 'none', value: 'none' },
              ],
              defaultValue: 'system',
            },
            colProps: { span: 6 },
          },
        ],
      },
      {
        valueType: 'group',
        columns: [
          {
            dataIndex: 'model',
            title: t('model'),
            valueType: 'devColumnRelationSelect',
            fieldProps: {
              modelId,
            },
            formItemProps: {
              extra: '如果选择的话，需要选择关联项而不是选择某个字段',
            },
            colProps: { span: 12 },
          },

          {
            dataIndex: 'modelName',
            title: t('modelName'),
            tooltip: '如果不选择数据源那么直接从列表页面的columnData中获取',
            colProps: { span: 12 },
          },
        ],
      },
      {
        valueType: 'group',
        columns: [
          {
            dataIndex: 'fieldNames',
            title: 'fieldNames',
            tooltip: '在dropdown中指定key和label的键值名称',
            colProps: { span: 12 },
          },
          {
            dataIndex: 'afterActionType',
            valueType: 'select',
            title: 'After Action',
            fieldProps: {
              options: [
                { label: 'reload', value: 'reload' },
                { label: 'goback', value: 'goback' },
                { label: 'none', value: 'none' },
                { label: 'just close modal', value: 'close' },
              ],
              defaultValue: 'reload',
            },
            colProps: { span: 12 },
          },
        ],
      },
    ],
  },
  {
    title: t('other'),
    formColumns: [
      {
        dataIndex: 'data',
        title: 'Post data',
        valueType: 'jsonEditor',
        fieldProps: {
          height: 250,
        },
      },
      {
        dataIndex: 'paramdata',
        title: 'Get data',
        valueType: 'jsonEditor',
        fieldProps: {
          height: 250,
        },
      },
    ],
  },
];

export default requestForm;
