import { Typography } from 'antd';
import type { Key } from 'react';
import { inArray } from '../../checkers';
import { dependencyOn } from '../../dev/vars/dependencyOn';
import rules from '../../dev/vars/rules';
import tagConfig from '../../dev/vars/tag';
import type { saFormColumnsType } from '../../helpers';
import { parseIcon, t } from '../../helpers';

export const getCustomerColumn = (modelId: Key) => {
  const dependencyOnVars = dependencyOn(modelId);
  const fieldPorpsColumn = {
    dataIndex: 'fieldProps',
    title: 'fieldProps',
    valueType: 'confirmForm',
    colProps: {
      span: 3,
    },
    fieldProps: {
      saFormProps: { devEnable: false },
      width: 1200,
      btn: {
        title: 'fieldProps',
        size: 'small',
      },
      formColumns: [
        {
          dataIndex: 'value',
          title: 'fieldProps',
          valueType: 'jsonEditor',
        },
        {
          dataIndex: 'cal',
          title: '运算表达式',
          valueType: 'textarea',
        },
      ],
    },
  };

  const columns: saFormColumnsType = [
    {
      valueType: 'group',
      columns: [
        {
          title: t('columnWidth'),
          dataIndex: ['props', 'width'],
          colProps: {
            span: 12,
          },
        },
        {
          title: t('grid'),
          dataIndex: ['props', 'span'],
          tooltip: '分为24格，不设置自动 = 24 / 列数',
          colProps: {
            span: 12,
          },
        },
        {
          title: t('notification'),
          dataIndex: ['props', 'tip'],
          valueType: 'confirmForm',
          fieldProps: {
            btn: {
              title: t('config'),
            },
            formColumns: [
              { dataIndex: 'placeholder', title: 'placeholder' },
              { dataIndex: 'tooltip', title: 'tooltip' },
              {
                dataIndex: 'extra',
                title: 'extra',
                valueType: 'textarea',
                tooltip: '提示会追加显示到组件后面',
              },
            ],
            saFormProps: { devEnable: false },
          },
          colProps: {
            span: 4,
          },
        },

        {
          title: t('validate'),
          dataIndex: ['props', 'rules'],
          valueType: 'confirmForm',
          fieldProps: {
            btn: {
              title: t('config'),
            },
            formColumns: rules,
            saFormProps: { devEnable: false },
          },
          colProps: {
            span: 4,
          },
        },
        {
          title: 'fieldProps',
          valueType: 'modalJson',
          dataIndex: ['props', 'fieldProps'],
          colProps: {
            span: 4,
          },
        },
        {
          dataIndex: ['props', 'page'],
          title: t('relatePage'),
          tooltip: '如果类型为formlist等，选择后自动读取所选菜单的columns配置',
          valueType: 'menuSelect',
          colProps: {
            span: 12,
          },
        },
      ],
    },
    {
      valueType: 'group',
      columns: [
        // {
        //   title: '模拟数据',
        //   valueType: 'modalJson',
        //   dataIndex: 'record',
        // },

        {
          title: 'formItemProps',
          valueType: 'modalJson',
          dataIndex: ['props', 'formItemProps'],
          colProps: {
            span: 4,
          },
        },
        {
          title: t('config'),
          valueType: 'modalJson',
          dataIndex: ['props', 'outside'],
          colProps: {
            span: 4,
          },
        },
        {
          dataIndex: ['props', 'if'],
          title: t('show'),
          valueType: 'modalJson',
          tooltip:
            '列表中record表示search部分，表单中表示数据data部分，列表中需要获取data的话请使用自定义组件',
          fieldProps: {
            type: 'textarea',
          },
          colProps: {
            span: 4,
          },
        },
        {
          dataIndex: ['props', 'dom_direction'],
          title: [t('show'), t('type')],
          valueType: 'select',
          fieldProps: {
            //buttonStyle: 'solid',
            defaultValue: 'horizontal',
            options: [
              { label: t('horizontal'), value: 'horizontal' },
              { label: t('vertical'), value: 'vertical' },
              { label: 'Dropdown', value: 'dropdown' },
              { label: 'none', value: 'none' },
            ],
          },
          colProps: {
            span: 12,
          },
        },
        {
          title: t('copy'),
          valueType: 'switch',
          dataIndex: ['props', 'copyable'],
          colProps: {
            span: 4,
          },
        },
        {
          title: 'ellipsis',
          valueType: 'switch',
          dataIndex: ['props', 'ellipsis'],
          colProps: {
            span: 4,
          },
        },
        {
          title: 'dependencyOn',
          dataIndex: ['props', 'dependencyOn'],
          valueType: 'confirmForm',
          fieldProps: {
            btn: {
              title: 'dependencyOn',
              size: 'middle',
            },
            msg: '依赖项配置，只控制表单项的显隐',
            formColumns: dependencyOnVars,
            saFormProps: { grid: false, devEnable: false },
          },
          colProps: {
            span: 4,
          },
        },
        {
          dataIndex: ['props', 'fixed'],
          title: 'fixed',
          valueType: 'select',
          fieldProps: {
            //buttonStyle: 'solid',
            defaultValue: 'none',
            options: [
              { label: 'none', value: 'none' },
              { label: 'left', value: 'left' },
              { label: 'right', value: 'right' },
            ],
          },
          colProps: {
            span: 12,
          },
        },
      ],
    },
    {
      dataIndex: ['props', 'items'],
      //dataIndex: 'items',
      title: 'DOM',
      valueType: 'formList',
      fieldProps: {
        //creatorRecord: { ...defaultBtn },
        //showtype: 'table',
        arrowSort: true,
        containerStyle: {
          width: 'calc(100% - 96px)',
        },
      },
      rowProps: {
        gutter: 0,
      },
      columns: [
        {
          valueType: 'group',
          columns: [
            {
              dataIndex: 'domtype',
              title: t('type'),
              valueType: 'select',
              fieldProps: {
                options: [
                  { label: 'button', value: 'button' },
                  { label: 'text', value: 'text' },
                  { label: 'divider', value: 'divider' },
                  { label: 'timeline', value: 'timeline' },
                  { label: 'actions', value: 'actions' },
                  { label: 'qrcode', value: 'qrcode' },
                  { label: 'tag', value: 'tag' },
                  { label: 'Badge', value: 'Badge' },
                  { label: 'table', value: 'table' },
                  { label: 'dayjsfrom', value: 'dayjsfrom' },
                ],
                size: 'small',
              },
              colProps: {
                span: 3,
              },
            },

            {
              valueType: 'dependency',
              name: ['domtype'],
              columns: ({ domtype }: any) => {
                //console.log('domtype change', domtype);
                if (domtype == 'timeline') {
                  return [
                    {
                      dataIndex: 'props',
                      title: 'Props',
                      valueType: 'modalJson',
                      colProps: {
                        span: 3,
                      },
                    },
                  ];
                }
                if (domtype == 'table') {
                  return [
                    fieldPorpsColumn,
                    {
                      dataIndex: 'page',
                      title: t('relatePage'),
                      valueType: 'menuSelect',
                      colProps: {
                        span: 6,
                      },
                    },
                  ];
                }
                if (domtype == 'tag') {
                  return tagConfig();
                }
                if (domtype == 'button' || domtype == 'text' || domtype == 'qrcode') {
                  const domExtColumns = [];
                  if (domtype == 'qrcode') {
                    domExtColumns.push({
                      dataIndex: 'errorLevel',
                      title: 'Qrcode Level',
                      valueType: 'select',
                      fieldProps: {
                        options: [
                          { label: 'L', value: 'L' },
                          { label: 'M', value: 'M' },
                          { label: 'Q', value: 'Q' },
                          { label: 'H', value: 'H' },
                        ],
                        size: 'small',
                      },
                      colProps: {
                        span: 3,
                      },
                    });
                  }
                  const domFormColumns = [
                    {
                      dataIndex: 'text',
                      title: t('text'),
                      valueType: 'textarea',
                      tooltip: '可写{{record,user}}表达式显示',
                    },
                    {
                      valueType: 'group',
                      columns: [
                        {
                          dataIndex: 'type',
                          title: 'Type',
                          valueType: 'select',
                          fieldProps: {
                            options: [
                              { label: 'default', value: 'default' },
                              { label: 'primary', value: 'primary' },
                              { label: 'ghost', value: 'ghost' },
                              { label: 'dashed', value: 'dashed' },
                              { label: 'link', value: 'link' },
                              { label: 'text', value: 'text' },
                            ],
                          },
                          width: 'xs',
                        },
                        {
                          dataIndex: 'size',
                          title: 'Size',
                          valueType: 'select',
                          fieldProps: {
                            options: [
                              { label: 'small', value: 'small' },
                              { label: 'middle', value: 'middle' },
                              { label: 'large', value: 'large' },
                            ],
                          },
                          width: 'xs',
                        },
                        {
                          dataIndex: 'icon',
                          title: 'Icon',
                          valueType: 'iconSelect',
                          fieldProps: {
                            width: 180,
                          },
                          width: 'xs',
                        },
                        { dataIndex: 'tooltip', title: 'Tooltip', width: 'xs' },
                        ...domExtColumns,
                      ],
                    },

                    { dataIndex: 'danger', title: 'Danger', valueType: 'switch' },
                    { dataIndex: 'copyable', title: 'Copyable', valueType: 'switch' },
                  ];
                  return [
                    {
                      valueType: 'group',
                      colProps: {
                        span: 21,
                      },
                      columns: [
                        {
                          dataIndex: 'if',
                          title: t('show'),
                          valueType: 'modalJson',
                          fieldProps: {
                            type: 'textarea',
                          },
                          colProps: {
                            span: 3,
                          },
                        },
                        {
                          dataIndex: 'btn',
                          title: 'DOM',
                          valueType: 'confirmForm',
                          fieldProps: {
                            formColumns: domFormColumns,
                            saFormProps: { grid: false, devEnable: false },
                          },
                          colProps: {
                            span: 3,
                          },
                        },
                        {
                          valueType: 'dependency',
                          name: ['btn'],
                          columns: ({ btn }: any) => {
                            //console.log(btn);
                            //return [];
                            return [
                              {
                                dataIndex: '',
                                title: 'title',
                                readonly: true,
                                render: () => {
                                  return (
                                    <Typography.Text
                                      code
                                      style={{ width: 60 }}
                                      ellipsis={{ tooltip: btn?.text }}
                                    >
                                      {parseIcon(btn?.icon)}
                                      {btn?.text}
                                    </Typography.Text>
                                  );
                                },
                                colProps: {
                                  span: 4,
                                },
                              },
                            ];
                          },
                        },
                        {
                          dataIndex: 'action',
                          title: 'Action',
                          valueType: 'select',
                          colProps: {
                            span: 4,
                          },
                          fieldProps: {
                            options: [
                              { label: 'confirm', value: 'confirm' },
                              { label: 'confirmForm', value: 'confirmForm' },
                              { label: 'modalTable', value: 'modalTable' },
                              { label: 'drawerTable', value: 'drawerTable' },
                              { label: 'dropdown', value: 'dropdown' },
                              { label: 'Popover', value: 'popover' },
                              { label: t('print'), value: 'print' },
                              { label: t('request'), value: 'request' },
                              { label: t('view'), value: 'view' },
                              { label: t('edit'), value: 'edit' },
                              { label: t('delete'), value: 'delete' },
                              { label: t('import'), value: 'import' },
                              { label: t('export'), value: 'export' },
                              { label: t('link'), value: 'link' },
                              { label: t('alink'), value: 'alink' },
                              { label: 'Iframe', value: 'iframe' },
                              { label: 'console', value: 'console' },
                            ],
                            size: 'small',
                          },
                        },
                        fieldPorpsColumn,
                        {
                          valueType: 'dependency',
                          name: ['action'],
                          columns: ({ action }: any) => {
                            const _columns = [];
                            if (action == 'confirmForm') {
                              //这里如果是confirmForm需要设置表单项，应该比较少 做成json编辑器 自己编辑
                              _columns.push({
                                dataIndex: 'modal',
                                title: 'Modal',
                                colProps: {
                                  span: 3,
                                },
                                valueType: 'confirmForm',
                                fieldProps: {
                                  saFormProps: { devEnable: false },
                                  width: 1200,
                                  formColumns: [
                                    {
                                      dataIndex: 'msg',
                                      title: t('title'),
                                    },
                                    {
                                      dataIndex: 'page',
                                      title: t('relatePage'),
                                      valueType: 'menuSelect',
                                    },
                                  ],
                                },
                              });
                            } else if (action == 'confirm' || action == 'print') {
                              _columns.push({
                                dataIndex: 'modal',
                                title: 'Modal',
                                colProps: {
                                  span: 3,
                                },
                                valueType: 'confirmForm',
                                fieldProps: {
                                  saFormProps: { devEnable: false },
                                  width: 1200,
                                  formColumns: [
                                    {
                                      dataIndex: 'title',
                                      title: t('title'),
                                    },
                                    {
                                      dataIndex: 'msg',
                                      title: t('notification'),
                                    },
                                    {
                                      dataIndex: 'type',
                                      title: t('type'),
                                      valueType: 'select',
                                      fieldProps: {
                                        options: [
                                          { label: 'modal', value: 'modal' },
                                          { label: 'Popconfirm', value: 'popconfirm' },
                                        ],
                                        defaultValue: 'modal',
                                      },
                                    },
                                  ],
                                },
                              });
                            } else if (action == 'modalTable' || action == 'drawerTable') {
                              _columns.push({
                                dataIndex: 'modal',
                                title: 'Modal',
                                colProps: {
                                  span: 3,
                                },
                                valueType: 'confirmForm',
                                fieldProps: {
                                  saFormProps: { devEnable: false },
                                  width: 1200,
                                  formColumns: [
                                    {
                                      dataIndex: 'title',
                                      title: t('title'),
                                    },
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
                                    },
                                    {
                                      dataIndex: 'page',
                                      title: t('relatePage'),
                                      valueType: 'menuSelect',
                                      formItemProps: {
                                        extra:
                                          '如果模型有多个菜单已关联，需要手动指定菜单，否则默认读取第一个',
                                      },
                                    },
                                    {
                                      dataIndex: 'drawerProps',
                                      title: 'Props',
                                      valueType: 'jsonEditor',
                                    },
                                  ],
                                },
                              });
                            }
                            return _columns;
                          },
                        },
                        {
                          valueType: 'dependency',
                          name: ['action'],
                          columns: ({ action }: any) => {
                            const action_ret: saFormColumnsType = [];
                            if (
                              inArray(action, [
                                'confirm',
                                'confirmForm',
                                'dropdown',
                                'print',
                                'request',
                                'import',
                                'export',
                              ]) >= 0
                            ) {
                              action_ret.push({
                                dataIndex: 'request',
                                colProps: {
                                  span: 4,
                                },
                                title: t('request'),
                                valueType: 'confirmForm',
                                fieldProps: {
                                  saFormProps: { devEnable: false },
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
                                          tooltip:
                                            '如果不选择数据源那么直接从列表页面的columnData中获取',
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
                              });
                            }
                            if (action == 'popover') {
                              action_ret.push({
                                dataIndex: 'popover',
                                colProps: {
                                  span: 4,
                                },
                                title: 'Popover',
                                valueType: 'confirmForm',
                                fieldProps: {
                                  formColumns: [
                                    {
                                      valueType: 'group',
                                      columns: [
                                        {
                                          dataIndex: 'type',
                                          title: '{{t("type")}}',
                                          valueType: 'select',
                                          fieldProps: {
                                            options: [
                                              { label: 'Text', value: 'content' },
                                              { label: 'Image', value: 'img' },
                                              { label: 'Qrcode', value: 'qrcode' },
                                            ],
                                          },
                                          colProps: {
                                            span: 12,
                                          },
                                        },
                                        {
                                          dataIndex: 'trigger',
                                          title: 'Trigger',
                                          valueType: 'select',
                                          fieldProps: {
                                            defaultValue: 'click',
                                            options: [
                                              { label: 'click', value: 'click' },
                                              { label: 'hover', value: 'hover' },
                                            ],
                                          },
                                          colProps: {
                                            span: 12,
                                          },
                                        },
                                      ],
                                    },

                                    {
                                      valueType: 'dependency',
                                      name: ['type'],
                                      columns: ({ type }: any) => {
                                        if (type == 'content') {
                                          return [
                                            {
                                              dataIndex: 'content',
                                              title: 'Content',
                                            },
                                          ];
                                        } else if (type == 'qrcode' || type == 'img') {
                                          return [
                                            {
                                              dataIndex: 'content',
                                              title: 'Content',
                                            },
                                            {
                                              dataIndex: 'errorLevel',
                                              title: 'Level',
                                              valueType: 'select',
                                              fieldProps: {
                                                options: [
                                                  { label: 'L', value: 'L' },
                                                  { label: 'M', value: 'M' },
                                                  { label: 'Q', value: 'Q' },
                                                  { label: 'H', value: 'H' },
                                                ],
                                              },
                                            },
                                            {
                                              dataIndex: 'size',
                                              title: 'Size',
                                              valueType: 'select',
                                              fieldProps: {
                                                options: [
                                                  { label: 'small', value: 'small' },
                                                  { label: 'middle', value: 'middle' },
                                                  { label: 'large', value: 'large' },
                                                ],
                                              },
                                            },
                                            {
                                              dataIndex: 'bordered',
                                              title: 'Border',
                                              valueType: 'switch',
                                            },
                                          ];
                                        }
                                        return [];
                                      },
                                    },
                                  ],
                                },
                              });
                            }
                            return action_ret;
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
      ],
    },
  ];
  return columns;
};
