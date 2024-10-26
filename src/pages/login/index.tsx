import CaptchaInput from '@/components/CaptchInput';
import Footer from '@/components/Footer';
import ButtonModal from '@/components/Sadmin/action/buttonModal';
import { WebSocketContext } from '@/components/Sadmin/hooks/websocket';
import { parseAdminSeting, saGetSetting } from '@/components/Sadmin/components/refresh';
import request, { setAdminSetting, setAdminToken } from '@/components/Sadmin/lib/request';
import {
  LoadingOutlined,
  LockOutlined,
  ThunderboltOutlined,
  UserOutlined,
  WechatOutlined,
} from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import {
  LoginForm,
  ProForm,
  ProFormCaptcha,
  ProFormCheckbox,
  ProFormDependency,
  ProFormInstance,
  ProFormText,
} from '@ant-design/pro-components';
import { Helmet, history, useIntl, useModel, useSearchParams } from '@umijs/max';
import { Tabs, QRCode, Space, theme, GetProp, Tooltip, Flex } from 'antd';
import React, { CSSProperties, useContext, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import cache from '@/components/Sadmin/helper/cache';
import { createStyles } from 'antd-style';
import { SelectLang } from '@/components/RightContent';
import { t } from '@/components/Sadmin/helpers';
import { SaDevContext } from '@/components/Sadmin/dev';

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

const LoginComponent: React.FC = () => {
  return <Login />;
};

const Login: React.FC = () => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const [captchaReload, setCaptchaReload] = useState(0);
  const [captchaPhoneReload, setCaptchaPhoneReload] = useState(0);
  const [showCaptcha, setShowCaptcha] = useState(false);

  const [isQrcode, setIsQrcode] = useState(false);

  const [searchParams] = useSearchParams();

  const { clientId, messageData, bind } = useContext(WebSocketContext);
  const { messageApi, notificationApi } = useContext(SaDevContext);
  const [setting, setSetting] = useState<any>();
  const { styles } = useStyles();
  const [loginType, setLoginType] = useState();
  useEffect(() => {
    saGetSetting().then((v) => {
      //console.log('setSetting', v);
      setSetting(v);
      setLoginType(v?.adminSetting?.loginTypeDefault);
    });
  }, []);

  const doLogin = (data) => {
    bind?.();
    setAdminSetting(data.setting);
    const adminSetting = parseAdminSeting(data.setting);
    setInitialState((s) => ({
      ...s,
      currentUser: data.userinfo,
      settings: adminSetting,
    })).then(() => {
      //const redirect = searchParams.get('redirect') || '/';
      const redirect = '/';
      let goUrl = '/';
      if (data.userinfo.redirect) {
        //后台登录后指定跳转页面
        goUrl = data.userinfo.redirect;
      } else if (initialState?.settings?.adminSetting?.baseurl) {
        goUrl = redirect.replace(initialState?.settings?.adminSetting?.baseurl, '/');
      }
      //console.log('goUrl is ', goUrl);
      history.push(goUrl);
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
      then: (res) => {
        const { code, msg, data } = res;
        if (res.code) {
          notificationApi?.error({ description: msg, message: '提示' });
          if (loginType == 'phone' && res.code == 3) {
            setCaptchaPhoneReload(captchaReload + 1);
          }
          if (showCaptcha) {
            setCaptchaReload(captchaReload + 1);
          }
          if (res.code == 3 || res.code == 2) {
            //需要输入图形验证码了
            setShowCaptcha(true);
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

  const formRef = useRef<ProFormInstance>();
  const intl = useIntl();
  const loginTypeItems = [
    {
      label: t('pages.login.phoneLogin.tab', intl),
      key: 'phone',
      children:
        loginType != 'phone' ? null : (
          <>
            <ProFormText
              name="mobile"
              fieldProps={{
                size: 'large',
                prefix: <UserOutlined />,
              }}
              placeholder={t('pages.login.phoneNumber.placeholder', intl)}
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
            />
            <ProForm.Item
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
            </ProForm.Item>
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
              <ProForm.Item
                name="captcha"
                rules={[
                  {
                    required: true,
                    message: '请输入图形验证码',
                  },
                ]}
              >
                <CaptchaInput reload={captchaReload} />
              </ProForm.Item>
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
            <ProFormText
              name="username"
              fieldProps={{
                size: 'large',
                prefix: <UserOutlined />,
              }}
              placeholder={t('pages.login.username.placeholder', intl)}
              rules={[
                {
                  required: true,
                  message: t('pages.login.username.required', intl),
                },
              ]}
            />
            <ProFormText.Password
              name="password"
              fieldProps={{
                size: 'large',
                prefix: <LockOutlined />,
                autoComplete: '',
              }}
              placeholder={t('pages.login.password.placeholder', intl)}
              rules={[
                {
                  required: true,
                  message: t('pages.login.password.required', intl),
                },
              ]}
            />
            {showCaptcha && (
              <ProForm.Item
                name="captcha"
                rules={[
                  {
                    required: true,
                    message: '请输入图形验证码',
                  },
                ]}
              >
                <CaptchaInput reload={captchaReload} />
              </ProForm.Item>
            )}
          </>
        ),
    },
  ];
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

  const ThunderLogin = (props) => {
    const { styles } = props;
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
          <LoadingOutlined className={styles.action} style={{ fontSize: 22 }} />
        ) : (
          <ThunderboltOutlined className={styles.action} style={{ fontSize: 22 }} onClick={click} />
        )}
      </Tooltip>
    );
  };

  const ActionLogin = (props) => {
    const { type } = props;
    const [timestamp, setTimestamp] = useState<number>(0);
    const [status, setStatus] = useState<GetProp<typeof QRCode, 'status'>>('active');
    const expiredTimes = 3 * 60; //3分钟后过期
    let tout: string | number | undefined | NodeJS.Timeout;
    const clock = (timestamp: number) => {
      const now = Date.now();
      // console.log(
      //   'timeis now',
      //   now,
      //   timestamp + expiredTimes * 1000,
      //   now > timestamp + expiredTimes * 1000,
      // );
      if (now > timestamp + expiredTimes * 1000) {
        //过期了
        //setTimestamp(now);
        setStatus('expired');
        //tout = setTimeout(() => clock(now), 1000);
      } else {
        tout = setTimeout(() => clock(timestamp), 1000);
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
              background: setting?.adminSetting?.loginBgCardColor,
              width: 380,
              marginTop: -72,
            }}
            bodyStyle={{ paddingTop: 0, paddingBottom: 0 }}
            className={styles.card}
          >
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
                    {setting?.adminSetting?.loginActions?.map((ac, index) => {
                      if (ac == 'wechat') {
                        return (
                          <ButtonModal
                            trigger={<WechatOutlined className={styles.action} />}
                            width={350}
                            title="扫码登录"
                            key="wechatlogin"
                          >
                            <ActionLogin key={index} type={ac} />
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
              {setting.adminSetting?.loginType?.length > 1 ? (
                <Tabs
                  centered
                  activeKey={loginType}
                  onChange={(activeKey) => {
                    setLoginType(activeKey);
                    setIsQrcode(activeKey == 'phone');
                  }}
                  items={setting.adminSetting?.loginType?.map((v) => {
                    return loginTypeItems.find((item) => item.key == v);
                  })}
                />
              ) : (
                loginTypeItems.find((item) => item.key == setting.adminSetting?.loginType?.[0])
                  ?.children
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
          </ProCard>
        </Flex>
      </div>
      <Footer />
    </div>
  ) : null;
};

export default LoginComponent;
