import { Typography } from 'antd';
import type { Key } from 'react';
import { inArray } from '../../checkers';
import { dependencyOn } from '../../dev/vars/dependencyOn';
import rules from '../../dev/vars/rules';
import tagConfig from '../../dev/vars/tag';
import type { saFormColumnsType } from '../../helpers';
import { parseIcon } from '../../helpers';

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
          title: '列宽',
          dataIndex: ['props', 'width'],
          colProps: {
            span: 12,
          },
        },
        {
          title: '栅格',
          dataIndex: ['props', 'span'],
          tooltip: '分为24格，不设置自动 = 24 / 列数',
          colProps: {
            span: 12,
          },
        },
        {
          title: '提示语',
          dataIndex: ['props', 'tip'],
          valueType: 'confirmForm',
          fieldProps: {
            btn: {
              title: '点击配置',
              size: 'middle',
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
          title: 'form校验',
          dataIndex: ['props', 'rules'],
          valueType: 'confirmForm',
          fieldProps: {
            btn: {
              title: '校验规则',
              size: 'middle',
            },
            msg: 'form项的校验规则',
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
          title: '关联页面',
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
          title: '整体配置',
          valueType: 'modalJson',
          dataIndex: ['props', 'outside'],
          colProps: {
            span: 4,
          },
        },
        {
          dataIndex: ['props', 'if'],
          title: '显示条件',
          valueType: 'modalJson',
          tooltip:
            '列表中record表示search部分，表单中表示数据data部分，列表中需要获取data的话请使用自定义组件',
          fieldProps: {
            title: '编辑条件',
            type: 'textarea',
          },
          colProps: {
            span: 4,
          },
        },
        {
          dataIndex: ['props', 'dom_direction'],
          title: 'dom排列方式',
          valueType: 'select',
          fieldProps: {
            //buttonStyle: 'solid',
            defaultValue: 'horizontal',
            options: [
              { label: '水平', value: 'horizontal' },
              { label: '垂直', value: 'vertical' },
              { label: 'Dropdown', value: 'dropdown' },
              { label: 'none', value: 'none' },
            ],
          },
          colProps: {
            span: 12,
          },
        },
        {
          title: '可复制',
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
      title: 'DOM列',
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
              title: '元素类型',
              valueType: 'select',
              fieldProps: {
                options: [
                  { label: '按钮', value: 'button' },
                  { label: '文字显示', value: 'text' },
                  { label: '分割线', value: 'divider' },
                  { label: '时间线', value: 'timeline' },
                  { label: 'actions', value: 'actions' },
                  { label: 'qrcode', value: 'qrcode' },
                  { label: 'tag', value: 'tag' },
                  { label: 'Badge', value: 'Badge' },
                  { label: 'table', value: 'table' },
                  { label: '时间长度', value: 'dayjsfrom' },
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
                      title: '属性设置',
                      valueType: 'modalJson',
                      fieldProps: {
                        title: '设置',
                        btn: { size: 'small' },
                      },
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
                      title: '关联菜单',
                      valueType: 'menuSelect',
                      colProps: {
                        span: 6,
                      },
                    },
                  ];
                }
                if (domtype == 'tag') {
                  return tagConfig;
                }
                if (domtype == 'button' || domtype == 'text' || domtype == 'qrcode') {
                  const domExtColumns = [];
                  if (domtype == 'qrcode') {
                    domExtColumns.push({
                      dataIndex: 'errorLevel',
                      title: '二维码质量',
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
                      title: '文字',
                      valueType: 'textarea',
                      tooltip: '可写{{record,user}}表达式显示',
                    },
                    {
                      valueType: 'group',
                      columns: [
                        {
                          dataIndex: 'type',
                          title: '格式',
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
                          title: '大小',
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
                          title: 'icon',
                          valueType: 'iconSelect',
                          fieldProps: {
                            width: 180,
                          },
                          width: 'xs',
                        },
                        { dataIndex: 'tooltip', title: 'tooltip', width: 'xs' },
                        ...domExtColumns,
                      ],
                    },

                    { dataIndex: 'danger', title: '危险按钮', valueType: 'switch' },
                    { dataIndex: 'copyable', title: '文字可复制', valueType: 'switch' },
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
                          title: '显示条件',
                          valueType: 'modalJson',
                          fieldProps: {
                            title: '编辑条件',
                            type: 'textarea',
                            btn: { size: 'small' },
                          },
                          colProps: {
                            span: 3,
                          },
                        },
                        {
                          dataIndex: 'btn',
                          title: 'DOM属性',
                          valueType: 'confirmForm',
                          fieldProps: {
                            btn: {
                              title: '编辑DOM',
                              size: 'small',
                            },
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
                          title: 'Action类型',
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
                              { label: 'Popover气泡卡片', value: 'popover' },
                              { label: '打印功能', value: 'print' },
                              { label: '请求', value: 'request' },
                              { label: '查看', value: 'view' },
                              { label: '编辑', value: 'edit' },
                              { label: '删除', value: 'delete' },
                              { label: '导入', value: 'import' },
                              { label: '导出', value: 'export' },
                              { label: '站内链接', value: 'link' },
                              { label: '外链接', value: 'alink' },
                              { label: '打开iframe', value: 'iframe' },
                              { label: 'console.log', value: 'console' },
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
                                title: 'modal配置',
                                colProps: {
                                  span: 3,
                                },
                                valueType: 'confirmForm',
                                fieldProps: {
                                  saFormProps: { devEnable: false },
                                  width: 1200,
                                  btn: {
                                    title: 'modal配置',
                                    size: 'small',
                                  },
                                  formColumns: [
                                    {
                                      dataIndex: 'msg',
                                      title: '头部标题',
                                    },
                                    {
                                      dataIndex: 'page',
                                      title: '表单选择',
                                      valueType: 'menuSelect',
                                    },
                                  ],
                                },
                              });
                            } else if (action == 'confirm' || action == 'print') {
                              _columns.push({
                                dataIndex: 'modal',
                                title: 'modal配置',
                                colProps: {
                                  span: 3,
                                },
                                valueType: 'confirmForm',
                                fieldProps: {
                                  saFormProps: { devEnable: false },
                                  width: 1200,
                                  btn: {
                                    title: 'modal配置',
                                    size: 'small',
                                  },
                                  formColumns: [
                                    {
                                      dataIndex: 'title',
                                      title: '头部标题',
                                    },
                                    {
                                      dataIndex: 'msg',
                                      title: '提示语',
                                    },
                                    {
                                      dataIndex: 'type',
                                      title: '显示类型',
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
                                title: 'modal配置',
                                colProps: {
                                  span: 3,
                                },
                                valueType: 'confirmForm',
                                fieldProps: {
                                  saFormProps: { devEnable: false },
                                  width: 1200,
                                  btn: {
                                    title: 'modal配置',
                                    size: 'small',
                                  },
                                  formColumns: [
                                    {
                                      dataIndex: 'title',
                                      title: '头部标题',
                                    },
                                    {
                                      dataIndex: 'model',
                                      title: '关联模型',
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
                                      title: '表单选择',
                                      valueType: 'menuSelect',
                                      formItemProps: {
                                        extra:
                                          '如果模型有多个菜单已关联，需要手动指定菜单，否则默认读取第一个',
                                      },
                                    },
                                    {
                                      dataIndex: 'drawerProps',
                                      title: 'drawer或modal配置',
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
                                title: 'request配置',
                                valueType: 'confirmForm',
                                fieldProps: {
                                  saFormProps: { devEnable: false },
                                  btn: {
                                    title: 'request配置',
                                    size: 'small',
                                  },
                                  formColumns: [
                                    {
                                      valueType: 'group',
                                      columns: [
                                        {
                                          dataIndex: 'url',
                                          title: 'URL地址',
                                          colProps: { span: 12 },
                                        },
                                        {
                                          dataIndex: 'method',
                                          valueType: 'select',
                                          title: '请求方式',
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
                                          title: '反馈方式',
                                          fieldProps: {
                                            options: [
                                              { label: '系统默认', value: 'system' },
                                              { label: '静默', value: 'none' },
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
                                          title: '数据源',
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
                                          title: '数据源名称',
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
                                          title: '请求后动作',
                                          fieldProps: {
                                            options: [
                                              { label: 'reload', value: 'reload' },
                                              { label: 'goback', value: 'goback' },
                                              { label: 'none', value: 'none' },
                                              { label: '仅关闭弹窗', value: 'close' },
                                            ],
                                            defaultValue: 'reload',
                                          },
                                          colProps: { span: 12 },
                                        },
                                      ],
                                    },
                                    {
                                      dataIndex: 'data',
                                      title: 'post额外传输数据',
                                      valueType: 'jsonEditor',
                                      fieldProps: {
                                        height: 250,
                                      },
                                    },
                                    {
                                      dataIndex: 'paramdata',
                                      title: 'get额外传输数据',
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
                                title: 'popover配置',
                                valueType: 'confirmForm',
                                fieldProps: {
                                  btn: {
                                    title: 'popover配置',
                                    size: 'small',
                                  },
                                  formColumns: [
                                    {
                                      valueType: 'group',
                                      columns: [
                                        {
                                          dataIndex: 'type',
                                          title: '弹出类型',
                                          valueType: 'select',
                                          fieldProps: {
                                            options: [
                                              { label: '文本', value: 'content' },
                                              { label: '图片', value: 'img' },
                                              { label: '二维码', value: 'qrcode' },
                                            ],
                                          },
                                          colProps: {
                                            span: 12,
                                          },
                                        },
                                        {
                                          dataIndex: 'trigger',
                                          title: '弹出行为',
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
                                              title: '弹出内容',
                                            },
                                          ];
                                        } else if (type == 'qrcode' || type == 'img') {
                                          return [
                                            {
                                              dataIndex: 'content',
                                              title: '二维码内容',
                                            },
                                            {
                                              dataIndex: 'errorLevel',
                                              title: '二维码质量',
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
                                              title: '大小',
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
                                              title: '边框',
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
