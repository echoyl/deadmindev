import { inArray } from '@/components/Sadmin/checkers';
import { SaDevContext } from '@/components/Sadmin/dev';
import { message } from '@/components/Sadmin/message';
import PostsForm from '@/components/Sadmin/posts/post';
import Refresh, { saGetSetting } from '@/components/Sadmin/components/refresh';
import request, { currentUser, messageLoadingKey } from '@/components/Sadmin/lib/request';
import { useModel } from '@umijs/max';
import { Button } from 'antd';
import { useContext } from 'react';

export default () => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const { setSetting } = useContext(SaDevContext);
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
    <PostsForm
      url="dev/setting"
      formTitle={false}
      devEnable={false}
      tabsProps={{
        tabBarExtraContent: (
          <Button type="text">
            <Refresh key="refresh" />
          </Button>
        ),
      }}
      tabs={[
        {
          title: '基础配置',
          formColumns: [
            { title: '系统名称', dataIndex: 'title' },
            { title: '技术支持', dataIndex: 'tech' },
            {
              valueType: 'group',
              columns: [
                { title: '子标题', dataIndex: 'subtitle', colProps: { span: 12 } },
                { title: '后台前缀', dataIndex: 'baseurl', colProps: { span: 12 } },
              ],
            },
            {
              valueType: 'group',
              columns: [
                {
                  title: '水印设置',
                  dataIndex: 'watermark',
                  tooltip: '1.username表示后台用户名',
                  colProps: { span: 24 },
                },
              ],
            },
            {
              valueType: 'group',
              columns: [
                { title: 'logo', valueType: 'uploader', dataIndex: 'logo', colProps: { span: 12 } },
                {
                  title: 'favicons',
                  tooltip: '自行覆盖目录下的favicon.ico 文件',
                  readonly: true,
                  dataIndex: 'favicons',
                  colProps: { span: 12 },
                },
              ],
            },
            {
              valueType: 'group',
              columns: [
                {
                  title: '开发模式',
                  valueType: 'switch',
                  dataIndex: 'dev',
                  fieldProps: {
                    defaultChecked: true,
                  },
                  colProps: { span: 12 },
                },
                {
                  title: '多语言',
                  valueType: 'switch',
                  dataIndex: 'lang',
                  fieldProps: {
                    defaultChecked: true,
                  },
                  colProps: { span: 12 },
                },
              ],
            },

            {
              valueType: 'group',
              title: '短信设置',
              columns: [
                {
                  title: '短信平台',
                  valueType: 'select',
                  dataIndex: 'sms_type',
                  fieldProps: {
                    options: [{ label: '阿里云', value: 'aliyun' }],
                  },
                  colProps: { span: 8 },
                },
                {
                  title: '验证码模板id',
                  dataIndex: 'sms_code_id',
                  colProps: { span: 8 },
                },
                {
                  title: '模板名称',
                  dataIndex: 'sms_name',
                  colProps: { span: 8 },
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
                { title: '腾讯地图key', dataIndex: 'tmap_key', colProps: { span: 12 } },
                { title: '百度地图key', dataIndex: 'bmap_key', colProps: { span: 12 } },
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
                            width:'100%',
                            colProps: { span: 12 },
                          },
                        ]
                      : [];
                  },
                },
              ],
            },

            { title: '主题色', dataIndex: 'colorPrimary', valueType: 'colorPicker',tooltip:'优先级高于右侧设置中选择的主题色' },
            { title: 'AntdPro配置', dataIndex: 'antdpro', valueType: 'jsonEditor',tooltip:'请将右侧设置按钮中的配置点击拷贝设置后粘贴到这里保存' },
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
                  dataIndex: 'loginBgImgage',
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
                    options: [{ label: '微信公众号', value: 'wechat' }],
                  },
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
                if (loginActions && inArray('wechat', loginActions) > -1) {
                  return [
                    {
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
                    },
                  ];
                }
                return [];
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
      ]}
      msgcls={async () => {
        await reload();
        return;
      }}
    />
  );
};
