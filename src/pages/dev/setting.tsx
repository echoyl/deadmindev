import { inArray } from '@/components/Sadmin/checkers';
import { DevLinks, SaDevContext } from '@/components/Sadmin/dev';
import { message } from '@/components/Sadmin/message';
import PostsForm from '@/components/Sadmin/posts/post';
import { saGetSetting } from '@/components/Sadmin/components/refresh';
import request, { currentUser, messageLoadingKey } from '@/components/Sadmin/lib/request';
import { useModel } from '@umijs/max';
import { useContext } from 'react';

export default () => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const { setting, setSetting } = useContext(SaDevContext);
  const reload = async () => {
    message.loading({ key: messageLoadingKey, content: 'loading...' });
    const msg = await currentUser();
    //const msg = await cuser();
    const setting = await saGetSetting(true);
    await request.get('dev/menu/clearCache');
    setInitialState((s) => ({
      ...s,
      settings: setting,
    })).then(() => {
      setSetting?.({
        ...initialState?.settings,
        ...setting,
      });
      message.success({ key: messageLoadingKey, content: '刷新成功' });
    });

    return msg.data;
  };
  return (
    <>
      <PostsForm
        url="dev/setting"
        formTitle={false}
        devEnable={false}
        // tabsProps={{
        //   tabBarExtraContent: (
        //     <Button type="text">
        //       <Refresh key="refresh" />
        //     </Button>
        //   ),
        // }}
        tabs={[
          {
            title: '基础配置',
            formColumns: [
              {
                valueType: 'group',
                columns: [
                  { title: '系统名称', dataIndex: 'title', colProps: { span: 12 } },
                  {
                    title: '后台前缀',
                    dataIndex: 'baseurl',
                    colProps: { span: 12 },
                    tooltip: '后台文件路径，因为构建有运行配置必须写死，所以这里默认为antadmin',
                  },
                ],
              },
              { title: '技术支持', dataIndex: 'tech' },
              {
                valueType: 'group',
                columns: [{ title: '子标题', dataIndex: 'subtitle', valueType: 'textarea' }],
              },
              {
                valueType: 'group',
                columns: [
                  {
                    title: '水印设置',
                    dataIndex: 'watermark',
                    tooltip: '1.username表示后台用户名.2.清空表示关闭水印',
                    colProps: { span: 12 },
                  },
                  {
                    title: '菜单最大层级',
                    dataIndex: 'menu_max_level',
                    tooltip: '后台菜单的最大层级，不要超过5层,默认为最大4层',
                    valueType: 'digit',
                    width: '100%',
                    colProps: { span: 12 },
                  },
                ],
              },
              {
                valueType: 'group',
                columns: [
                  {
                    title: 'logo',
                    valueType: 'uploader',
                    dataIndex: 'logo',
                    colProps: { span: 12 },
                  },
                  {
                    title: '开发模式',
                    valueType: 'switch',
                    dataIndex: 'dev',
                    fieldProps: {
                      defaultChecked: true,
                    },
                    colProps: { span: 6 },
                  },
                  {
                    title: '多语言',
                    valueType: 'switch',
                    dataIndex: 'lang',
                    fieldProps: {
                      defaultChecked: true,
                    },
                    colProps: { span: 6 },
                  },
                ],
              },

              {
                valueType: 'group',
                title: '短信设置',
                columns: [
                  {
                    title: '短信平台',
                    tooltip: '仅用于后台验证码登录',
                    valueType: 'select',
                    dataIndex: 'sms_type',
                    fieldProps: {
                      options: [{ label: '阿里云', value: 'aliyun' }],
                    },
                    colProps: { span: 12 },
                  },
                  {
                    title: '验证码模板id',
                    dataIndex: 'sms_code_id',
                    colProps: { span: 6 },
                  },
                  {
                    title: '签名名称',
                    dataIndex: 'sms_name',
                    colProps: { span: 6 },
                  },
                ],
              },
            ],
          },
          {
            title: '地图设置',
            formColumns: [
              {
                valueType: 'group',
                columns: [
                  {
                    title: '地图类型',
                    dataIndex: 'map_type',
                    valueType: 'select',
                    fieldProps: {
                      options: [
                        { label: '天地图', value: 'tianmap' },
                        { label: '腾讯地图', value: 'tmap' },
                        { label: '百度地图', value: 'bmap' },
                        { label: '高德地图', value: 'amap' },
                      ],
                    },
                    colProps: { span: 24 },
                    formItemProps: {
                      extra:
                        '默认使用腾讯地图，如果需要使用其他地图，请先申请key，并填写到下方，建议使用天地图暂时没有授权问题',
                    },
                  },
                ],
              },
              {
                valueType: 'group',
                columns: [
                  { title: '腾讯地图key', dataIndex: 'tmap_key', colProps: { span: 12 } },
                  { title: '百度地图key', dataIndex: 'bmap_key', colProps: { span: 12 } },
                  { title: '天地图key', dataIndex: 'tianmap_key', colProps: { span: 12 } },
                  { title: '高德地图key', dataIndex: 'amap_key', colProps: { span: 6 } },
                  { title: '高德地图安全密钥', dataIndex: 'amap_skey', colProps: { span: 6 } },
                ],
              },
              {
                valueType: 'group',
                columns: [
                  {
                    title: '默认经度',
                    dataIndex: ['map', 'default_lat'],
                    colProps: { span: 12 },
                    tooltip: '设置默认经纬度后打开地图会自动定位到该位置',
                  },
                  { title: '默认纬度', dataIndex: ['map', 'default_lng'], colProps: { span: 12 } },
                ],
              },
            ],
          },
          {
            title: '主题配置',
            formColumns: [
              {
                valueType: 'group',
                columns: [
                  {
                    valueType: 'switch',
                    title: '自动暗黑模式',
                    dataIndex: 'theme_auto_dark',
                    fieldProps: {
                      defaultChecked: false,
                    },
                    colProps: { span: 12 },
                  },
                  {
                    valueType: 'dependency',
                    name: ['theme_auto_dark'],
                    columns: ({ theme_auto_dark }: any) => {
                      return theme_auto_dark
                        ? [
                            {
                              title: '白天时间段',
                              valueType: 'timeRange',
                              dataIndex: 'theme_auto_light_time_range',
                              fieldProps: {
                                minuteStep: 15,
                                secondStep: 10,
                              },
                              width: '100%',
                              colProps: { span: 12 },
                            },
                          ]
                        : [];
                    },
                  },
                ],
              },
              {
                valueType: 'group',
                columns: [
                  // {
                  //   title: '侧边栏暗黑模式',
                  //   dataIndex: 'siderDark',
                  //   valueType: 'switch',
                  //   tooltip: '只有导航模式为侧边菜单布局(layout:side)模式下该设置才会生效',
                  //   colProps: { span: 12 },
                  // },
                  {
                    title: '侧边栏背景',
                    dataIndex: 'siderColor',
                    valueType: 'radioButton',
                    colProps: { span: 6 },
                    fieldProps: {
                      buttonStyle: 'solid',
                      defaultValue: 'transparent',
                      options: [
                        { label: '透明', value: 'transparent' },
                        { label: '黑色', value: 'dark' },
                        { label: '白色', value: 'white' },
                      ],
                    },
                  },
                  {
                    title: '头部背景',
                    dataIndex: 'headerColor',
                    valueType: 'radioButton',
                    colProps: { span: 6 },
                    fieldProps: {
                      buttonStyle: 'solid',
                      defaultValue: 'transparent',
                      options: [
                        { label: '透明', value: 'transparent' },
                        { label: '黑色', value: 'dark' },
                        { label: '白色', value: 'white' },
                      ],
                    },
                  },
                  {
                    title: '主题色',
                    dataIndex: 'colorPrimary',
                    valueType: 'colorPicker',
                    tooltip: '优先级高于右侧设置中选择的主题色',
                    colProps: { span: 12 },
                  },
                ],
              },
              {
                title: 'AntdPro配置',
                dataIndex: 'antdpro',
                valueType: 'jsonEditor',
                tooltip:
                  '请将右侧设置按钮中的配置点击拷贝设置后粘贴到这里保存,{"layout": "side | mix","splitMenus": true | false}',
              },
              { title: 'Antd主题配置', dataIndex: 'theme', valueType: 'jsonEditor' },
            ],
          },
          {
            title: '登录设置',
            formColumns: [
              {
                valueType: 'group',
                columns: [
                  {
                    title: '登录页背景图',
                    valueType: 'uploader',
                    dataIndex: 'loginBgImage',
                    colProps: { span: 12 },
                  },
                  {
                    title: '登录框背景色',
                    valueType: 'colorPicker',
                    dataIndex: 'loginBgCardColor',
                    tooltip: '如果使用了登录背景图导致登录框不清晰，可以设置该值，默认为none',
                    colProps: { span: 12 },
                  },
                ],
              },

              {
                valueType: 'group',
                columns: [
                  {
                    title: '登录方式',
                    valueType: 'checkbox',
                    dataIndex: 'loginType',
                    fieldProps: {
                      options: [
                        { label: '账号密码', value: 'password' },
                        { label: '手机号登录', value: 'phone' },
                      ],
                    },
                    colProps: { span: 12 },
                  },
                  {
                    title: '默认登录方式',
                    valueType: 'radio',
                    dataIndex: 'loginTypeDefault',
                    fieldProps: {
                      options: [
                        { label: '账号密码', value: 'password' },
                        { label: '手机号登录', value: 'phone' },
                      ],
                    },
                    colProps: { span: 12 },
                  },
                ],
              },

              {
                valueType: 'group',
                columns: [
                  {
                    title: '其它登录方式',
                    valueType: 'checkbox',
                    dataIndex: 'loginActions',
                    fieldProps: {
                      options: [
                        { label: '微信公众号', value: 'wechat' },
                        { label: '快捷登录', value: 'thunder' },
                      ],
                    },
                    colProps: { span: 12 },
                  },
                  {
                    title: '自动跳转',
                    valueType: 'switch',
                    dataIndex: ['login', 'autoRedirect'],
                    colProps: { span: 12 },
                    tooltip: '开启后登录成功后自动跳转url中的redirect参数，默认为关闭',
                  },
                ],
              },
              {
                valueType: 'group',
                columns: [
                  {
                    title: '登录后跳转页面',
                    dataIndex: ['login', 'defaultRedirectPage'],
                    tooltip: '账号登录跳转的页面路由地址，默认为菜单的第一个',
                    colProps: { span: 12 },
                  },
                  {
                    title: '显示验证码登录错误次数',
                    dataIndex: 'login_error_times',
                    tooltip: '登录失败该次数后展示图形验证码输入框，默认数字为3次',
                    colProps: { span: 12 },
                  },
                ],
              },
              {
                valueType: 'dependency',
                name: ['loginActions'],
                columns: ({ loginActions }) => {
                  //console.log('loginActions', loginActions);
                  const _columns = [];
                  if (loginActions) {
                    if (inArray('wechat', loginActions) > -1) {
                      _columns.push({
                        valueType: 'group',
                        columns: [
                          {
                            title: '二维码地址',
                            dataIndex: ['loginWechat', 'url'],
                            colProps: { span: 12 },
                          },
                          {
                            title: '描述文字',
                            dataIndex: ['loginWechat', 'desc'],
                            colProps: { span: 12 },
                          },
                        ],
                      });
                    }
                    if (inArray('thunder', loginActions) > -1) {
                      _columns.push({
                        valueType: 'group',
                        columns: [
                          {
                            title: '请求url',
                            dataIndex: ['loginThunder', 'url'],
                            colProps: { span: 12 },
                            tooltip: '请求url请注意是否跨域',
                          },
                          {
                            title: 'Tooltip文字',
                            dataIndex: ['loginThunder', 'desc'],
                            colProps: { span: 12 },
                          },
                        ],
                      });
                    }
                  }
                  return _columns;
                },
              },
            ],
          },
          {
            title: 'Socket配置',
            formColumns: [
              {
                title: '是否开启',
                dataIndex: ['socket', 'open'],
                valueType: 'switch',
              },
              {
                title: '连接地址',
                dataIndex: ['socket', 'url'],
              },
              {
                valueType: 'group',
                columns: [
                  {
                    title: '开启ping',
                    dataIndex: ['socket', 'ping'],
                    valueType: 'switch',
                  },
                  {
                    valueType: 'dependency',
                    name: [['socket', 'ping']],
                    columns: ({ socket }) => {
                      if (socket?.ping) {
                        return [
                          {
                            title: '时间间隔',
                            dataIndex: ['socket', 'pingInterval'],
                            valueType: 'digit',
                            colProps: { span: 12 },
                            fieldProps: {
                              addonAfter: '秒',
                            },
                            // formItemProps: {
                            //   rules: [
                            //     {
                            //       required: true,
                            //     },
                            //   ],
                            // },
                            width: '100%',
                          },
                          {
                            title: 'ping信息',
                            dataIndex: ['socket', 'pingData'],
                            colProps: { span: 12 },
                            // formItemProps: {
                            //   rules: [
                            //     {
                            //       required: true,
                            //     },
                            //   ],
                            // },
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
          {
            title: 'IconFont',
            formColumns: [
              {
                title: 'URL配置',
                valueType: 'formList',
                columns: [
                  {
                    valueType: 'group',
                    columns: [{ title: 'URL', dataIndex: 'url' }],
                  },
                ],
                dataIndex: ['iconfont', 'urls'],
              },
              {
                title: 'JSON配置',
                tooltip: '将iconfont网站项目中查看json配置中数据复制到此处',
                dataIndex: ['iconfont', 'json'],
                valueType: 'jsonEditor',
              },
            ],
          },
          {
            title: '悬浮按钮',
            formColumns: [
              {
                dataIndex: ['floatButton', 'shape'],
                //dataIndex: 'items',
                title: '按钮形状',
                valueType: 'select',
                fieldProps: {
                  options: [
                    { label: '圆形', value: 'circle' },
                    { label: '方形', value: 'square' },
                  ],
                },
              },
              {
                dataIndex: ['floatButton', 'items'],
                //dataIndex: 'items',
                title: '按钮配置',
                valueType: 'formList',
                fieldProps: {
                  //creatorRecord: { ...defaultBtn },
                  showtype: 'table',
                },
                columns: [
                  {
                    valueType: 'group',
                    columns: [
                      {
                        dataIndex: 'icon',
                        title: 'Icon',
                        valueType: 'iconSelect',
                        colProps: { span: 6 },
                      },
                      {
                        dataIndex: 'type',
                        title: '类型',
                        valueType: 'select',
                        fieldProps: {
                          options: [
                            { label: '弹出菜单', value: 'floatmenu' },
                            { label: '弹出图片', value: 'alertimg' },
                            { label: '链接地址', value: 'link' },
                          ],
                        },
                        colProps: { span: 3 },
                      },

                      {
                        valueType: 'dependency',
                        name: ['type'],
                        columns: ({ type }: any) => {
                          if (type == 'floatmenu') {
                            return [
                              {
                                dataIndex: 'menus',
                                //dataIndex: 'items',
                                title: '菜单配置',
                                valueType: 'formList',
                                colProps: { span: 24 },
                                columns: [
                                  {
                                    valueType: 'group',
                                    columns: [
                                      {
                                        dataIndex: 'icon',
                                        title: 'Icon',
                                        valueType: 'iconSelect',
                                        colProps: { span: 6 },
                                      },
                                      {
                                        dataIndex: 'title',
                                        title: '名称',
                                        colProps: { span: 6 },
                                        fieldProps: {
                                          placeholder: '请输入名称',
                                        },
                                      },
                                      {
                                        dataIndex: 'link',
                                        title: '链接',
                                        colProps: { span: 6 },
                                        fieldProps: {
                                          placeholder: '请输入链接地址',
                                        },
                                      },
                                      {
                                        dataIndex: 'target',
                                        title: '打开方式',
                                        valueType: 'select',
                                        colProps: { span: 6 },
                                        fieldProps: {
                                          options: [
                                            { label: '当前窗口', value: '_self' },
                                            { label: '新窗口', value: '_blank' },
                                          ],
                                        },
                                      },
                                    ],
                                  },
                                ],
                              },
                            ];
                          } else if (type == 'alertimg') {
                            return [
                              {
                                valueType: 'group',
                                columns: [
                                  {
                                    dataIndex: 'width',
                                    title: '宽',
                                    valueType: 'digit',
                                    colProps: { span: 8 },
                                    width: '100%',
                                  },
                                  {
                                    dataIndex: 'height',
                                    title: '高',
                                    valueType: 'digit',
                                    colProps: { span: 8 },
                                    width: '100%',
                                  },
                                  {
                                    dataIndex: 'img',
                                    title: '图片',
                                    valueType: 'uploader',
                                    fieldProps: {
                                      buttonType: 'table',
                                    },
                                    colProps: { span: 8 },
                                  },
                                ],
                              },
                            ];
                          } else if (type == 'link') {
                            return [
                              {
                                valueType: 'group',
                                columns: [
                                  {
                                    dataIndex: 'link',
                                    title: '链接地址',
                                    colProps: { span: 8 },
                                  },
                                  {
                                    dataIndex: 'target',
                                    title: '打开方式',
                                    valueType: 'select',
                                    colProps: { span: 8 },
                                    fieldProps: {
                                      options: [
                                        { label: '当前窗口', value: '_self' },
                                        { label: '新窗口', value: '_blank' },
                                      ],
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
            ],
          },
        ]}
        msgcls={async ({ code }) => {
          if (!code) {
            await reload();
          }
          return;
        }}
      />
    </>
  );
};
