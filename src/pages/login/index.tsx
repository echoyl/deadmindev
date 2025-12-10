import CaptchaInput from '@/components/CaptchInput';
import Footer from '@/components/Footer';
import { SelectLang } from '@/components/RightContent';
import ButtonModal from '@/components/Sadmin/action/buttonModal';
import { parseAdminSeting, saGetSetting } from '@/components/Sadmin/components/refresh';
import { SaDevContext } from '@/components/Sadmin/dev';
import { useAdminStore } from '@/components/Sadmin/dev/context';
import cache from '@/components/Sadmin/helper/cache';
import { t, uid } from '@/components/Sadmin/helpers';
import { WebSocketContext } from '@/components/Sadmin/hooks/websocket';
import request, { setAdminSetting, setAdminToken } from '@/components/Sadmin/lib/request';
import {
  LoadingOutlined,
  LockOutlined,
  ThunderboltOutlined,
  UserOutlined,
  WechatOutlined,
} from '@ant-design/icons';
import type { ProFormInstance } from '@ant-design/pro-components';
import {
  LoginForm,
  ProCard,
  ProFormCaptcha,
  ProFormCheckbox,
  ProFormDependency,
} from '@ant-design/pro-components';
import { Helmet, history, useIntl, useModel, useSearchParams } from '@umijs/max';
import type { GetProp } from 'antd';
import { Flex, Form, Input, QRCode, Space, Tabs, theme, Tooltip } from 'antd';
import { createStyles } from 'antd-style';
import type { CSSProperties } from 'react';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';

const useStyles = () => {
  return createStyles(({ token, css }) => {
    return {
      action: {
        marginLeft: '8px',
        color: token.colorPrimaryHover,
        fontSize: '24px',
        verticalAlign: 'middle',
        cursor: 'pointer',
        transition: 'color 0.3s',
        '&:hover': {
          color: token.colorPrimary,
        },
      },
      lang: {
        width: 42,
        height: 42,
        lineHeight: '42px',
        position: 'fixed',
        right: 16,
        borderRadius: token.borderRadius,
        ':hover': {
          backgroundColor: token.colorBgTextHover,
        },
      },
      container: {
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'auto',
        backgroundSize: '100% 100%',
      },
    };
  })();
};

const Lang = () => {
  const { styles } = useStyles();

  return (
    <div className={styles.lang} data-lang>
      <SelectLang />
    </div>
  );
};

export const Login: React.FC<{ setting?: Record<string, any>; type?: 'page' | 'modal' }> = ({
  setting,
  type = 'page',
}) => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const [captchaReload, setCaptchaReload] = useState(0);
  const [captchaPhoneReload, setCaptchaPhoneReload] = useState(0);
  const [showCaptcha, setShowCaptcha] = useState(false);

  const [isQrcode, setIsQrcode] = useState(false);

  const [searchParams] = useSearchParams();

  const { clientId, messageData, bind } = useContext(WebSocketContext);
  const { messageApi, notificationApi, setSetting: setSettingDev } = useContext(SaDevContext);
  const [loginType, setLoginType] = useState<string>(
    setting?.adminSetting?.loginTypeDefault || 'password',
  );
  const { styles } = useStyles();
  const setShowLogin = useAdminStore((state) => state.setShowLogin);
  const setPageKey = useAdminStore((state) => state.setPageKey);
  useEffect(() => {
    cache.get('Sa-ShowCaptcha').then((v) => {
      setShowCaptcha(v ? true : false);
    });
  }, [setting]);

  const doLogin = (data: Record<string, any>) => {
    bind?.();
    //删除showCaptcha
    cache.remove('Sa-ShowCaptcha');
    setAdminSetting(data.setting);
    const adminSetting = parseAdminSeting(data.setting);
    setInitialState((s) => ({
      ...s,
      currentUser: data.userinfo,
      settings: adminSetting,
    })).then(() => {
      setSettingDev?.(adminSetting);
      const {
        adminSetting: {
          login: { autoRedirect = false, defaultRedirectPage = '' } = {},
          baseurl = '',
        } = {},
      } = adminSetting || {};
      if (type == 'page') {
        const auto_redirect = autoRedirect ? searchParams.get('redirect') : '';
        const redirect = auto_redirect || data.userinfo.redirect || defaultRedirectPage || '/';
        const goUrl = redirect.replace(baseurl, '/');
        history.push(goUrl);
      } else {
        setShowLogin(false);
        setPageKey(uid()); //设置page组件key重载组件
      }
    });
  };

  useEffect(() => {
    //console.log('messageData', messageData);
    if (!messageData) {
      return;
    }
    const { data } = messageData;

    if (data?.action == 'login') {
      //如果是登录的话 跳转登录
      cache.set('Sa-Remember', 1);
      //重新设置messagedata，如果这个时候退出登录而没有清空 messagedata的话会一直重复这个动作 服务器发送退出登录的消息 这里可以不用设置messagedata
      //setMessageData?.(false);
      setAdminToken(data.access_token).then(() => {
        messageApi?.success({
          content: data.msg,
          duration: 1,
          onClose: () => {
            flushSync(() => {
              doLogin(data);
            });
          },
        });
      });
    }
  }, [messageData]);

  //console.log('clientId', clientId, initialState?.settings);

  //console.log('redirect', searchParams.get('redirect'));

  const handleSubmit = async (values: API.LoginParams) => {
    // 登录
    await request.post('login', {
      data: { ...values, loginType },
      duration: 1,
      then: (res: Record<string, any>) => {
        const { code, msg, data } = res;
        if (res.code) {
          notificationApi?.error({ description: msg, title: '提示' });
          if (loginType == 'phone' && res.code == 3) {
            setCaptchaPhoneReload(captchaReload + 1);
          }
          if (showCaptcha) {
            setCaptchaReload(captchaReload + 1);
          }
          if (res.code == 3 || res.code == 2) {
            //需要输入图形验证码了
            setShowCaptcha(true);
            //设置一个缓存，如果刷新页面后初始化读取这个缓存的值
            cache.set('Sa-ShowCaptcha', 1);
          }
        } else {
          if (values.autoLogin) {
            cache.set('Sa-Remember', 1);
          } else {
            cache.set('Sa-Remember', 0);
          }
          setAdminToken(res.data.access_token).then(() => {
            messageApi?.success({
              content: msg,
              duration: 1,
              onClose: () => {
                flushSync(() => {
                  doLogin(res.data);
                });
              },
            });
          });
        }
      },
    });
    return;
  };

  const formRef = useRef<ProFormInstance>(null);
  const intl = useIntl();
  const loginTypeItems = [
    {
      label: t('pages.login.phoneLogin.tab', intl),
      key: 'phone',
      children:
        loginType != 'phone' ? null : (
          <>
            <Form.Item
              name="mobile"
              rules={[
                {
                  required: true,
                  message: t('pages.login.phoneNumber.required', intl),
                },
                {
                  pattern: /^1\d{10}$/,
                  message: t('pages.login.phoneNumber.invalid', intl),
                },
              ]}
            >
              <Input
                size="large"
                prefix={<UserOutlined />}
                placeholder={t('pages.login.phoneNumber.placeholder', intl)}
              />
            </Form.Item>
            <Form.Item
              name="captchaPhone"
              rules={[
                {
                  required: true,
                  message: t('pages.login.captcha.required', intl),
                },
              ]}
            >
              <CaptchaInput
                reload={captchaPhoneReload}
                placeholder={t('pages.login.captcha.placeholder', intl)}
              />
            </Form.Item>
            <ProFormDependency name={['captchaPhone']}>
              {({ captchaPhone }) => {
                return (
                  <ProFormCaptcha
                    fieldProps={{
                      size: 'large',
                      prefix: <LockOutlined />,
                    }}
                    countDown={60}
                    captchaProps={{
                      size: 'large',
                    }}
                    phoneName="mobile"
                    placeholder={t('pages.login.captcha.placeholder', intl)}
                    captchaTextRender={(timing, count) => {
                      if (timing) {
                        return `${count} ${t('pages.login.phoneLogin.getVerificationCode', intl)}`;
                      }
                      return t('pages.login.phoneLogin.getVerificationCode', intl);
                    }}
                    name="mobilecode"
                    rules={[
                      {
                        required: true,
                        message: t('pages.login.captcha.required', intl),
                      },
                    ]}
                    onGetCaptcha={async (phone) => {
                      try {
                        await formRef.current?.validateFields(['captcha']);
                      } catch (errorInfo) {
                        //setConfirmLoading(false);
                        throw new Error('表单验证失败');
                      }
                      const { code, msg } = await request.post('sms', {
                        data: { mobile: phone, captcha: captchaPhone },
                      });
                      if (code) {
                        throw new Error(msg);
                      }
                    }}
                  />
                );
              }}
            </ProFormDependency>
            {showCaptcha && (
              <Form.Item
                name="captcha"
                rules={[
                  {
                    required: true,
                    message: '请输入图形验证码',
                  },
                ]}
              >
                <CaptchaInput reload={captchaReload} />
              </Form.Item>
            )}
          </>
        ),
    },
    {
      label: t('pages.login.accountLogin.tab', intl),
      key: 'password',
      children:
        loginType != 'password' ? null : (
          <>
            <Form.Item
              name="username"
              rules={[{ required: true, message: t('pages.login.username.required', intl) }]}
            >
              <Input
                size="large"
                prefix={<UserOutlined />}
                placeholder={t('pages.login.username.placeholder', intl)}
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, message: t('pages.login.password.required', intl) }]}
            >
              <Input
                size="large"
                autoComplete=""
                prefix={<LockOutlined />}
                type="password"
                placeholder={t('pages.login.password.placeholder', intl)}
              />
            </Form.Item>
            {showCaptcha && (
              <Form.Item
                name="captcha"
                rules={[
                  {
                    required: true,
                    message: '请输入图形验证码',
                  },
                ]}
              >
                <CaptchaInput reload={captchaReload} />
              </Form.Item>
            )}
          </>
        ),
    },
  ];

  const ThunderLogin: React.FC<{ styles?: Record<string, any> }> = (props) => {
    const { styles: istyles = {} } = props;
    const [loading, setLoading] = useState<boolean>(false);
    const { url, desc } = setting?.adminSetting?.loginThunder;
    const click = async () => {
      setLoading(true);
      await request.post(url, { data: { client_id: clientId } });
      setLoading(false);
      return;
    };
    return (
      <Tooltip title={desc}>
        {loading ? (
          <LoadingOutlined className={istyles.action} style={{ fontSize: 22 }} />
        ) : (
          <ThunderboltOutlined
            className={istyles.action}
            style={{ fontSize: 22 }}
            onClick={click}
          />
        )}
      </Tooltip>
    );
  };

  const ActionLogin: React.FC = () => {
    const [timestamp, setTimestamp] = useState<number>(0);
    const [status, setStatus] = useState<GetProp<typeof QRCode, 'status'>>('active');
    const expiredTimes = 3 * 60; //3分钟后过期
    let tout: string | number | undefined | NodeJS.Timeout;
    const clock = (itimestamp: number) => {
      const now = Date.now();
      // console.log(
      //   'timeis now',
      //   now,
      //   timestamp + expiredTimes * 1000,
      //   now > timestamp + expiredTimes * 1000,
      // );
      if (now > itimestamp + expiredTimes * 1000) {
        //过期了
        //setTimestamp(now);
        setStatus('expired');
        //tout = setTimeout(() => clock(now), 1000);
      } else {
        tout = setTimeout(() => clock(itimestamp), 1000);
      }
    };
    const refresh = () => {
      const now = Date.now();
      setTimestamp(now);
      setStatus('active');
      tout = setTimeout(() => clock(now), 1000);
    };
    useEffect(() => {
      const tm = Date.now();
      setTimestamp(tm);
      tout = setTimeout(() => clock(tm), 1000);
      return () => clearTimeout(tout);
    }, []);

    const { url, desc } = setting?.adminSetting?.loginWechat;
    const qrcodeUrl = url + '?client_id=' + clientId + '&timestamp=' + timestamp;
    console.log('qrcodeUrl', qrcodeUrl);
    return (
      <div style={{ textAlign: 'center' }}>
        {timestamp ? (
          <QRCode
            style={{ margin: '0 auto' }}
            value={qrcodeUrl}
            status={status}
            onRefresh={refresh}
          />
        ) : null}
        <div style={{ marginTop: 20 }}>{desc}</div>
      </div>
    );
  };
  return (
    <LoginForm
      contentStyle={{
        minWidth: 280,
        maxWidth: '75vw',
      }}
      containerStyle={{
        paddingInline: 0,
      }}
      formRef={formRef}
      logo={setting?.logo}
      title={setting?.title}
      subTitle={
        setting?.adminSetting?.subtitle ? (
          <span
            style={{ display: 'block', marginBlockEnd: -28 }}
            dangerouslySetInnerHTML={{ __html: setting?.adminSetting?.subtitle }}
          ></span>
        ) : null
      }
      initialValues={{
        autoLogin: true,
      }}
      onFinish={async (values) => {
        await handleSubmit(values as API.LoginParams);
      }}
      //submitter={isQrcode ? false : undefined}
      actions={
        setting?.adminSetting?.loginActions ? (
          <Space>
            {t('pages.login.loginWith', intl)}
            {setting?.adminSetting?.loginActions?.map((ac: string, index: number) => {
              if (ac == 'wechat') {
                return (
                  <ButtonModal
                    trigger={<WechatOutlined className={styles.action} />}
                    width={350}
                    title="扫码登录"
                    key="wechatlogin"
                  >
                    <ActionLogin key={index} />
                  </ButtonModal>
                );
              } else if (ac == 'thunder') {
                return <ThunderLogin key="thunderlogin" styles={styles} />;
              } else {
                return <></>;
              }
            })}
          </Space>
        ) : null
      }
    >
      {setting?.adminSetting?.loginType?.length > 1 ? (
        <Tabs
          centered
          activeKey={loginType}
          onChange={(activeKey) => {
            setLoginType(activeKey);
            setIsQrcode(activeKey == 'phone');
          }}
          items={setting?.adminSetting?.loginType?.map((v: string) => {
            return loginTypeItems.find((item) => item.key == v);
          })}
        />
      ) : (
        loginTypeItems.find((item) => item.key == setting?.adminSetting?.loginType?.[0])?.children
      )}

      <div
        style={{
          marginBottom: 24,
        }}
        key="login_bottom"
      >
        <ProFormCheckbox noStyle name="autoLogin">
          {t('pages.login.rememberMe', intl)}
        </ProFormCheckbox>
        <a
          style={{
            float: 'right',
          }}
          onClick={() => {
            messageApi?.info('请使用手机号登录后修改,或联系后台管理员修改账号密码！');
          }}
        >
          {t('pages.login.forgotPassword', intl)}
        </a>
      </div>
    </LoginForm>
  );
};

const LoginPage: React.FC = () => {
  const [setting, setSetting] = useState<any>();
  const { styles } = useStyles();
  useEffect(() => {
    saGetSetting().then((v) => {
      setSetting(v);
    });
  }, []);
  const { token } = theme.useToken();
  const containerStyle: CSSProperties = {};
  if (setting?.navTheme == 'light') {
    if (setting?.adminSetting?.loginBgImage) {
      containerStyle.backgroundImage = `url("${setting?.adminSetting?.loginBgImage}")`;
    } else {
      containerStyle.backgroundImage = `url("${setting?.adminSetting?.baseurl}/login_bg.png")`;
    }
  } else {
    containerStyle.background = token.colorBgBase;
  }
  return setting ? (
    <div className={styles.container} style={{ ...containerStyle }}>
      <Helmet>
        <title>登录 - {setting?.title}</title>
      </Helmet>
      {setting?.adminSetting?.lang ? <Lang /> : null}
      <div style={{ flex: '1' }}>
        <Flex align="center" justify="center" style={{ height: '100%' }}>
          <ProCard
            style={{
              //maxWidth: 440,
              //margin: '0px auto',
              // padding: '20px 0',
              background:
                setting?.navTheme == 'light' ? setting?.adminSetting?.loginBgCardColor : 'none',
              width: 380,
              marginTop: -72,
            }}
            bodyStyle={{ paddingTop: 0, paddingBottom: 0 }}
          >
            <Login setting={setting} />
          </ProCard>
        </Flex>
      </div>
      <Footer />
    </div>
  ) : null;
};

const LoginComponent: React.FC = () => {
  return <LoginPage />;
};

export default LoginComponent;
